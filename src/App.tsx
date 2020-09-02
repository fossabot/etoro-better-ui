import React, { Fragment } from 'react'
import { registerReactComponent } from '~/utils/registerReactComponent'
import styled from 'styled-components'
import { PingProbeHidden } from '~/components/PingProbeHidden'
import { TradingStatusProbeHidden } from '~/components/TradingStatusProbeHidden'

const Hidden = styled.span`
  display: none;
`

export const App: React.FC = props => {
  return (
    <Fragment>
      <Fragment>
        <PingProbeHidden />
        <TradingStatusProbeHidden />
      </Fragment>
    </Fragment>
  )
}

registerReactComponent({
  component: (
    <Hidden>
      <App />
    </Hidden>
  ),
  containerId: App.name,
  containerConstructor: containerElement => {
    $(`.i-menu-user-info`).append(containerElement)
  },
})