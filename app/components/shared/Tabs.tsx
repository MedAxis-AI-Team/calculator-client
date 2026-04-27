import type { ActiveTab } from '../../lib/types'
import './Tabs.css'

interface Props {
  activeTab: ActiveTab
  onSwitch: (tab: ActiveTab) => void
}

const TABS: { id: ActiveTab; label: string }[] = [
  { id: 'funding_mix', label: 'Funding Mix' },
  { id: 'runway',      label: 'Runway' },
]

export default function Tabs({ activeTab, onSwitch }: Props) {
  return (
    <nav className="tabs" role="tablist" aria-label="Calculator tabs">
      {TABS.map(tab => (
        <button
          key={tab.id}
          role="tab"
          aria-selected={activeTab === tab.id}
          className={`tabs__item${activeTab === tab.id ? ' tabs__item--active' : ''}`}
          onClick={() => onSwitch(tab.id)}
        >
          {tab.label}
        </button>
      ))}
    </nav>
  )
}
