import {
  Button,
  ListItem,
  ListItemAvatar,
  ListItemSecondaryAction,
  ListItemText,
} from '@material-ui/core'
import React, { Fragment } from 'react'
import { useInterval } from 'react-use'
import styled from 'styled-components'
import { InstrumentPosition } from '~/angularAPI'
import { InstrumentIcon } from '~/components/InstrumentIcon'
import { InstrumentRateChangeCount } from '~/components/InstrumentRateChangeCount'
import { PrimaryTrans } from '~/components/PrimaryTrans'
import { ProfitText } from '~/components/ProfitText'
import { RateSignalIcon } from '~/components/RateSignalIcon'
import { gaAPI, GaEventId } from '~/gaAPI'
import { useInstrumentPosition } from '~/hooks/useInstrumentPosition'
import { useAppSelector } from '~/store/_store'

const StyledListItem = styled(ListItem)<{
  closing?: boolean
  closed?: boolean
  active?: boolean
}>`
  :hover {
    background-color: #dbdbdbcc !important;
    filter: none;
  }

  filter: ${props => (props.closed || !props.active ? `grayscale(1)` : `none`)};
  outline: ${props =>
    props.closed || props.closing ? `1px solid #bebebe` : 'none'};
  transition-duration: ${props =>
    props.closed || props.closing ? '5s' : 'none'};
  opacity: ${props => (props.closed || props.closing ? `0.85` : 'auto')};
  pointer-events: ${props => (props.closed || props.closing ? `none` : 'auto')};
  transform: ${props =>
    props.closed ? 'none' : props.closing ? `translateX(-100vw)` : 'none'};
  min-height: 60px;
  background-color: ${props => (props.closed ? '#919191' : 'inherit')};
`

export const InstrumentPositionListItem: React.FC<{
  positionId?: InstrumentPosition['PositionID']
}> = props => {
  const {
    closed,
    closing,
    setClosing,
    position,
    update,
  } = useInstrumentPosition(props.positionId)
  const updateRate = useAppSelector(
    state => state.settings.tradeDashboardRefreshRate,
  )
  const dashboardOpen = useAppSelector(
    state => state.settings.showTradeDashboard,
  )

  useInterval(() => {
    if (!props.positionId || closed) {
      return
    }

    update()
  }, (dashboardOpen && props.positionId && updateRate) || null)

  useInterval(() => {
    // if you can't close the position, revert closing prop when update
    setClosing(false)
  }, (props.positionId && !closed && 5000) || null)

  if (!position) {
    return <StyledListItem></StyledListItem>
  }

  return (
    <StyledListItem
      closed={closed ? 'true' : undefined}
      closing={closing ? 'true' : undefined}
      active={position.Instrument.IsActive ? 'true' : undefined}
    >
      <ListItemAvatar>
        <InstrumentIcon instrument={position.Instrument}></InstrumentIcon>
      </ListItemAvatar>

      <ListItemText
        primary={
          <Fragment>
            ${position.Amount} x{position.Leverage}
          </Fragment>
        }
        secondary={
          <Fragment>
            <ProfitText
              profit={position.OpenRate}
              pureDollar
              noDollarSign
            ></ProfitText>
            <Fragment> </Fragment>
            {(position.IsBuy && (
              <PrimaryTrans i18nKey='tradeDashboard_itBuy'></PrimaryTrans>
            )) || <PrimaryTrans i18nKey='tradeDashboard_itSell'></PrimaryTrans>}
          </Fragment>
        }
      ></ListItemText>

      <ListItemText
        primary={
          <Fragment>
            <RateSignalIcon change={position.LastRateChange} />

            {/* Open Rate */}
            <ProfitText
              profit={position.CurrentRate}
              noDollarSign
              noNegative
              pureDollar
            ></ProfitText>

            <Fragment> </Fragment>

            {/* Change Rate count per-tick of up/down */}
            <ProfitText
              profit={position.LastRateChange}
              noDollarSign
            ></ProfitText>
          </Fragment>
        }
      ></ListItemText>

      <ListItemText
        primary={
          <Fragment>
            {/* up/down rate count with Open Rate */}
            <InstrumentRateChangeCount position={position} />
          </Fragment>
        }
      ></ListItemText>

      <ListItemText
        primary={
          <Fragment>
            <ProfitText
              profit={(position.Profit / position.Amount) * 100}
              noDollarSign
              suffix={'%'}
            ></ProfitText>

            <Fragment> </Fragment>

            <ProfitText profit={position.Profit}></ProfitText>
          </Fragment>
        }
      ></ListItemText>

      <ListItemSecondaryAction>
        <Button
          variant='outlined'
          disabled={position.isPendingClose}
          onClick={event => {
            gaAPI.sendEvent(GaEventId.tradeDashboard_closePositionClick)
            position.close()
          }}
        >
          {closed ? (
            <PrimaryTrans i18nKey='tradeDashboard_positionClosed'></PrimaryTrans>
          ) : (
            <PrimaryTrans i18nKey='tradeDashboard_actionClose'></PrimaryTrans>
          )}
        </Button>
      </ListItemSecondaryAction>
    </StyledListItem>
  )
}
