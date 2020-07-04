import { angularAPI } from '@/angularAPI'
import { ExecutionDialogControlsId } from '@/components/ExecutionDialog/ExecutionDialogControls'
import { ExecutionDialogStatusInfoId } from '@/components/ExecutionDialog/ExecutionDialogStatusInfo'
import { debugAPI } from '@/debugAPI'
import { emitter, Events } from '@/emitter'
import { initializeIcons } from '@fluentui/react'
import { throttle } from 'lodash'

let autoRenderOnRouteChangeSuccessTimerId: ReturnType<
  typeof globalThis['setTimeout']
>

export function applyEventsObserver() {
  $('body').undelegate('.main-app-view', 'mouseover.bootstrap')

  initializeIcons()

  /**
   * On Execution-Dialog closed
   */
  angularAPI.$rootScope.$watch(
    () => {
      return angularAPI.$rootScope.layoutCtrl.uiDialog.isDialogOpen
    },
    (newValue, oldValue) => {
      if (newValue !== oldValue && newValue === false) {
        debugAPI.angular.extend('isDialogOpen')(newValue)
        emitter.emit(Events.onDialogNotFount)
      }
    },
  )

  /**
   * Angular.on $routeChangeSuccess
   */
  angularAPI.$rootScope.$on('$routeChangeSuccess', angularEvent => {
    debugAPI.angular.extend('$routeChangeSuccess')(globalThis.location.pathname)

    emitter.emit(Events.onUnmountUIs)

    globalThis.clearTimeout(autoRenderOnRouteChangeSuccessTimerId)

    autoRenderOnRouteChangeSuccessTimerId = globalThis.setTimeout(() => {
      emitter.emit(Events.onMountUIs)
    }, 500)
  })

  /**
   * Make sure whole extension UI renders
   *
   * useful if components unexpected missing renders
   * for example, angular route changes will remove containers (which is React-Components),
   * re-renders ASAP is provider better UX
   *
   * balance with performance (via throttle)
   */
  $('body').delegate(
    '.main-app-view',
    'mouseover',
    throttle(event => {
      emitter.emit(Events.onMountUIs)
    }, 3000),
  )

  /**
   * Make sure Execution-Dialog extension UI renders
   *
   * balance with performance (via throttle)
   */
  $('body').delegate(
    '.execution-main',
    'mouseover',
    throttle(event => {
      const dialogComponentsNotReady = [
        $(`#${ExecutionDialogControlsId}`).length > 0,
        $(`#${ExecutionDialogStatusInfoId}`).length > 0,
      ].some(isReady => !isReady)

      const isDialogOpen =
        angularAPI.$rootScope.layoutCtrl.uiDialog.isDialogOpen

      if (isDialogOpen && dialogComponentsNotReady) {
        emitter.emit(Events.onDialogHover)
      }
    }, 500),
  )

  /**
   * "I want to close all positions" the dialog get display
   *
   * balance with performance (via throttle)
   */
  $('body').delegate(
    `[data-etoro-automation-id="close-all-positions-window"]`,
    'mouseover',
    throttle(() => {
      emitter.emit(Events.onCloseAllPositionsDialogHover)
    }, 1000),
  )

  /**
   * "More Button"(s) on hover
   */
  $('body').delegate(
    '.more-info-button',
    'mouseover',
    throttle(() => {
      emitter.emit(Events.onMoreInfoButtonHover)
    }, 50),
  )

  /**
   * Ping every interval
   *
   * useful in continuously status checking... etc.
   */
  globalThis.setInterval(() => {
    emitter.emit(Events.onPing)
  }, 5000)

  debugAPI.universal('extension events get ready!')
}