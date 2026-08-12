'use client'

import { motion } from 'framer-motion'

export type DiaryTab = 'book' | 'calendar' | 'timeline'

interface DiaryNavigationTabsProps {
  activeTab: DiaryTab
  onTabChange: (tab: DiaryTab) => void
}

const tabs: { id: DiaryTab; icon: string; label: string }[] = [
  { id: 'book', icon: '📖', label: 'Book' },
  { id: 'calendar', icon: '🗓️', label: 'Calendar' },
  { id: 'timeline', icon: '🕰️', label: 'Timeline' }
]

export default function DiaryNavigationTabs({ activeTab, onTabChange }: DiaryNavigationTabsProps) {
  return (
    <div className="w-full max-w-4xl mx-auto mb-8">
      {/* Desktop & Tablet: Horizontal tabs */}
      <div className="hidden sm:flex bg-white/10 backdrop-blur-lg rounded-2xl p-2 border border-white/20">
        <div className="flex w-full gap-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`
                flex-1 relative px-6 py-3 rounded-xl font-medium transition-all duration-300
                ${activeTab === tab.id 
                  ? 'text-white' 
                  : 'text-white/60 hover:text-white/80 hover:bg-white/5'
                }
              `}
            >
              {/* Active tab background with glow */}
              {activeTab === tab.id && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute inset-0 bg-gradient-to-r from-pink-500/30 to-purple-500/30 rounded-xl border-2 border-pink-400/40"
                  style={{
                    boxShadow: '0 0 20px rgba(236, 72, 153, 0.3)'
                  }}
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                />
              )}
              
              {/* Tab content */}
              <div className="relative flex items-center justify-center gap-2">
                <span className="text-xl">{tab.icon}</span>
                <span className="font-semibold">{tab.label}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Mobile: Scrollable horizontal tabs */}
      <div className="sm:hidden bg-white/10 backdrop-blur-lg rounded-2xl p-2 border border-white/20 overflow-x-auto scrollbar-hide">
        <div className="flex gap-2 min-w-max">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`
                relative px-4 py-3 rounded-xl font-medium transition-all duration-300 whitespace-nowrap
                ${activeTab === tab.id 
                  ? 'text-white' 
                  : 'text-white/60 hover:text-white/80 hover:bg-white/5'
                }
              `}
            >
              {/* Active tab background with glow */}
              {activeTab === tab.id && (
                <motion.div
                  layoutId="activeTabMobile"
                  className="absolute inset-0 bg-gradient-to-r from-pink-500/30 to-purple-500/30 rounded-xl border-2 border-pink-400/40"
                  style={{
                    boxShadow: '0 0 20px rgba(236, 72, 153, 0.3)'
                  }}
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                />
              )}
              
              {/* Tab content */}
              <div className="relative flex items-center justify-center gap-2">
                <span className="text-lg">{tab.icon}</span>
                <span className="font-semibold text-sm">{tab.label}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  )
}
