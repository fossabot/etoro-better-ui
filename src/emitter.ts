/* eslint-disable @typescript-eslint/no-unsafe-return */
import Emittery from 'emittery'
import { debugAPI } from '@/debugAPI'

export enum Events {
  ready = 'ready',
  onPing = 'onPing',
  settingChange = 'settingChange',
  onWatchlistPageHover = 'onWatchlistPageHover',
  onPortfolioPageHover = 'onPortfolioPageHover',
  onPortfolioHistoryPageHover = 'onPortfolioHistoryPageHover',
  onSidebarHover = 'onSidebarHover',
  onDialogHover = 'onDialogHover',
  onMoreInfoButtonHover = 'onMoreInfoButtonHover',
}

export const emitter = new Emittery.Typed<
  Record<string, any>,
  keyof typeof Events
>()

// 使每個 emitter 之 events 的接受端受到 emit 觸發時，皆會記錄在 console
emitter.on = new Proxy(emitter.on.bind(emitter), {
  apply(target, key, receiver: [Events, (...args) => any]) {
    if (typeof receiver[1] === 'function') {
      receiver[1] = new Proxy(receiver[1], {
        apply(listenserTarget, listenserKey, listenserReceiver) {
          receiver[1].name && debugAPI.events(receiver[0], receiver[1].name)
          return Reflect.apply(listenserTarget, listenserKey, listenserReceiver)
        },
      })
    }

    return Reflect.apply(target, key, receiver)
  },
})

// 使每個 emitter 之 events 的接受端受到 emit 觸發時，皆會記錄在 console
emitter.once = new Proxy(emitter.once.bind(emitter), {
  apply(onceFn, key, receiver: [Events, (...args) => any]) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const newOnceFn = Reflect.apply(onceFn, key, receiver)

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
    newOnceFn['then'] = new Proxy(newOnceFn['then'], {
      apply: (
        listenserTarget,
        listenserKey,
        listenserReceiver: [(...args) => unknown],
      ) => {
        debugAPI.events(receiver[0], listenserReceiver[0].name)
        return Reflect.apply(listenserTarget, listenserKey, listenserReceiver)
      },
    })

    return newOnceFn
  },
})
