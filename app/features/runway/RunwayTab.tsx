import type { AppState, AppAction } from '../../lib/types'
import RunwayInputs from './RunwayInputs'
import RunwayResults from './RunwayResults'
import { calculateRunway } from '../../lib/calculations'

interface Props {
  state: AppState
  dispatch: React.Dispatch<AppAction>
}

export default function RunwayTab({ state, dispatch }: Props) {
  const result = calculateRunway(state.runway)
  return (
    <div>
      <RunwayInputs runway={state.runway} currency={state.currency} dispatch={dispatch} />
      <RunwayResults result={result} currency={state.currency} />
    </div>
  )
}
