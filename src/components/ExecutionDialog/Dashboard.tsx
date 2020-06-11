import * as React from 'react'
import toast from 'cogo-toast'
import { ButtonGroup, Button } from '@blueprintjs/core'
import HelperContent from '../HelperContent'
import { storage } from '../../storage'
import { useTypedSelector } from '@/store/_store'
import { setMacroAmount } from '@/actions/setMacroAmount'
import { useAppDispatch } from '@/hooks/useAppDispatch'
import { i18n } from '@/i18n'

const toAmount = (value: number) => {
  $('[data-etoro-automation-id="execution-button-switch-to-amount"]').click()

  const inputEl = $(
    '[data-etoro-automation-id="execution-amount-input-section"]',
  ).find('input')

  inputEl.val(`${value}`)
  inputEl.change()
  inputEl.blur()
}

const toLever = (value: number) => {
  const targetTabEl = $(
    '[ng-click="$ctrl.tabsCtrl.selectTab($ctrl, $event)"]',
  ).eq(1)

  const isTarget =
    // 英文
    targetTabEl.text().toLowerCase().includes('leverage') ||
    // 馬來文
    targetTabEl.text().includes('leveraj') ||
    // 中文
    targetTabEl.text().includes('槓桿') ||
    targetTabEl.text().includes('槓杆')

  if (isTarget) {
    // tab 先按下後，等到 ng-if 使元素出現，在 select 按下
    targetTabEl.click()

    $(`.risk-itemlevel:contains(" x${value} ")`).click()
  } else {
    toast.info(<div>{i18n.動作沒有執行()}</div>)
  }
}

export const Dashboard = () => {
  const dispatch = useAppDispatch()

  const amounts = useTypedSelector(
    state => state.settings.betterEtoroUIConfig.executionAmount,
  )
  const levers = useTypedSelector(
    state => state.settings.betterEtoroUIConfig.executionLever,
  )

  React.useEffect(() => {
    toast.warn(
      <span>
        {i18n.確保同意下單巨集風險(() => (
          <HelperContent.RiskSpecification aStyle={{ color: 'blue' }} />
        ))}
      </span>,
    )
  }, [])

  if (!storage.findConfig().executionMacroEnabled) {
    return null
  }

  return (
    <React.Fragment>
      <HelperContent.WhoDeveloper />

      <React.Fragment>
        <div style={{ marginBottom: 8 }}>
          <h2 style={{ textAlign: 'center' }}>{i18n.金額()}</h2>
          <ButtonGroup fill={true} large={true} vertical={true}>
            {amounts.map(value => {
              return (
                <Button
                  onClick={toAmount.bind(toAmount, value)}
                  intent='primary'
                >
                  $<span>{value}</span>
                </Button>
              )
            })}
          </ButtonGroup>
        </div>

        <div style={{ marginBottom: 16 }}>
          <Button
            icon='settings'
            onClick={() => {
              dispatch(setMacroAmount())
            }}
          >
            {i18n.設定()}
          </Button>
        </div>

        <div style={{ marginBottom: 16 }}>
          <h2 style={{ textAlign: 'center' }}>{i18n.槓桿()}</h2>
          <ButtonGroup fill={true} large={true} vertical={true}>
            {levers.map(value => {
              return (
                <Button onClick={toLever.bind(toLever, value)} intent='primary'>
                  x<span>{value}</span>
                </Button>
              )
            })}
          </ButtonGroup>
        </div>
      </React.Fragment>

      <HelperContent.RiskSpecification aStyle={{ color: 'blue' }} />
    </React.Fragment>
  )
}