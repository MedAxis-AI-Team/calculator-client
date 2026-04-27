import type { Company, Currency, AppAction } from '../../lib/types'
import CurrencyInput from '../shared/CurrencyInput'
import PercentInput from '../shared/PercentInput'
import './CompanyBasics.css'

interface Props {
  company: Company
  currency: Currency
  dispatch: React.Dispatch<AppAction>
}

export default function CompanyBasics({ company, currency, dispatch }: Props) {
  function setField(field: keyof Company, value: number) {
    dispatch({ type: 'SET_COMPANY_FIELD', field, value })
  }

  return (
    <section className="company-basics">
      <h2 className="company-basics__title">Company Basics</h2>
      <div className="company-basics__grid">
        <CurrencyInput
          label="Pre-money valuation"
          value={company.preMoney}
          currency={currency}
          onChange={v => setField('preMoney', v)}
          hint="What investors agree your company is worth before new money comes in"
        />
        <PercentInput
          label="Current founder ownership"
          value={company.founderOwnershipPct}
          onChange={v => setField('founderOwnershipPct', v)}
          hint="Combined ownership of all founders before this round"
        />
      </div>
    </section>
  )
}
