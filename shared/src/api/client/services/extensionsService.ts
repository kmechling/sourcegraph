import { combineLatest, from, Subscribable } from 'rxjs'
import { distinctUntilChanged, map, switchMap, tap } from 'rxjs/operators'
import {
    ConfiguredExtension,
    getScriptURLFromExtensionManifest,
    isExtensionEnabled,
} from '../../../extensions/extension'
import { viewerConfiguredExtensions } from '../../../extensions/helpers'
import { PlatformContext } from '../../../platform/context'
import { isErrorLike } from '../../../util/errors'
import { isEqual, memoizeAsync } from '../../util'
import { Model } from '../model'
import { SettingsService } from './settings'

/**
 * The information about an extension necessary to execute and activate it.
 */
export interface ExecutableExtension extends Pick<ConfiguredExtension, 'id'> {
    /** The URL to the JavaScript bundle of the extension. */
    scriptURL: string
}

/**
 * Manages the set of extensions that are available and activated.
 *
 * @internal This is an internal implementation detail and is different from the product feature called the
 * "extension registry" (where users can search for and enable extensions).
 */
export class ExtensionsService {
    public constructor(
        private platformContext: Pick<PlatformContext, 'queryGraphQL' | 'getScriptURLForExtension'>,
        private model: Subscribable<Pick<Model, 'visibleTextDocuments'>>,
        private settingsService: Pick<SettingsService, 'data'>,
        private extensionActivationFilter = extensionsWithMatchedActivationEvent
    ) {}

    protected configuredExtensions: Subscribable<ConfiguredExtension[]> = viewerConfiguredExtensions({
        settings: this.settingsService.data,
        queryGraphQL: this.platformContext.queryGraphQL,
    })

    public get enabledExtensions(): Subscribable<ConfiguredExtension[]> {
        return combineLatest(from(this.settingsService.data), this.configuredExtensions).pipe(
            map(([settings, configuredExtensions]) =>
                configuredExtensions.filter(x => isExtensionEnabled(settings.final, x.id))
            )
        )
    }

    /**
     * Returns an observable that emits the set of extensions that should be active, based on the previous and
     * current state and each available extension's activationEvents.
     *
     * An extension is activated when one or more of its activationEvents is true. After an extension has been
     * activated, it remains active for the rest of the session (i.e., for as long as the browser tab remains open)
     * as long as it remains enabled. If it is disabled, it is deactivated. (I.e., "activationEvents" are
     * retrospective/sticky.)
     *
     * @todo Consider whether extensions should be deactivated if none of their activationEvents are true (or that
     * plus a certain period of inactivity).
     *
     * @param extensionActivationFilter A function that returns the set of extensions that should be activated
     * based on the current model only. It does not need to account for remembering which extensions were
     * previously activated in prior states.
     */
    public get activeExtensions(): Subscribable<ExecutableExtension[]> {
        // Extensions that have been activated (including extensions with zero "activationEvents" that evaluate to
        // true currently).
        const activatedExtensionIDs: string[] = []
        return combineLatest(from(this.model), this.enabledExtensions).pipe(
            tap(([model, enabledExtensions]) => {
                const activeExtensions = this.extensionActivationFilter(enabledExtensions, model)
                for (const x of activeExtensions) {
                    if (!activatedExtensionIDs.includes(x.id)) {
                        activatedExtensionIDs.push(x.id)
                    }
                }
            }),
            map(([, extensions]) => (extensions ? extensions.filter(x => activatedExtensionIDs.includes(x.id)) : [])),
            distinctUntilChanged((a, b) => isEqual(a, b)),
            switchMap(async extensions =>
                Promise.all(
                    extensions.map(x =>
                        Promise.resolve(
                            this.memoizedGetScriptURLForExtension(getScriptURLFromExtensionManifest(x))
                        ).then(
                            scriptURL =>
                                scriptURL === null
                                    ? null
                                    : {
                                          id: x.id,
                                          scriptURL,
                                      }
                        )
                    )
                )
            ),
            map(extensions => extensions.filter((x): x is ExecutableExtension => x !== null))
        )
    }

    private memoizedGetScriptURLForExtension = memoizeAsync<string, string | null>(
        url =>
            Promise.resolve(this.platformContext.getScriptURLForExtension(url)).catch(err => {
                console.error(`Error fetching extension script URL ${url}`, err)
                return null
            }),
        url => url
    )
}

function extensionsWithMatchedActivationEvent(
    enabledExtensions: ConfiguredExtension[],
    model: Pick<Model, 'visibleTextDocuments'>
): ConfiguredExtension[] {
    return enabledExtensions.filter(x => {
        try {
            if (!x.manifest) {
                console.warn(`Extension ${x.id} was not found. Remove it from settings to suppress this warning.`)
                return false
            } else if (isErrorLike(x.manifest)) {
                console.warn(x.manifest)
                return false
            } else if (!x.manifest.activationEvents) {
                console.warn(`Extension ${x.id} has no activation events, so it will never be activated.`)
                return false
            }
            const visibleTextDocumentLanguages = model.visibleTextDocuments
                ? model.visibleTextDocuments.map(({ languageId }) => languageId)
                : []
            return x.manifest.activationEvents.some(
                e => e === '*' || visibleTextDocumentLanguages.some(l => e === `onLanguage:${l}`)
            )
        } catch (err) {
            console.error(err)
        }
        return false
    })
}
