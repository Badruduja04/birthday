'use client'

import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Plus, X, Check, ChevronLeft, ChevronRight } from 'lucide-react'

interface MonthlyPlannerProps {
  userId: string
}

interface PlannerData {
  id?: string
  month: string
  focus_theme: string
  goals: string[]
  priorities: string[]
  notes: string
  gratitude_list: string[]
}

interface HabitData {
  id: string
  habit_name: string
  habit_icon: string
  tracked_dates: string[]
}

const HABIT_ICONS = ['💪', '📖', '💧', '🧘', '🏃', '🎨', '🎵', '🌱']

const MOODS = [
  { emoji: '😊', label: 'Amazing' },
  { emoji: '😃', label: 'Good' },
  { emoji: '😐', label: 'Okay' },
  { emoji: '😔', label: 'Tired' },
  { emoji: '😞', label: 'Bad' },
]

export default function MonthlyPlanner({ userId }: MonthlyPlannerProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [plannerData, setPlannerData] = useState<PlannerData>({
    month: getFirstDayOfMonth(new Date()),
    focus_theme: '',
    goals: [],
    priorities: [],
    notes: '',
    gratitude_list: [],
  })
  
  const [habits, setHabits] = useState<HabitData[]>([])
  const [newGoal, setNewGoal] = useState('')
  const [newPriority, setNewPriority] = useState('')
  const [newGratitude, setNewGratitude] = useState('')
  const [newHabit, setNewHabit] = useState('')
  const [selectedIcon, setSelectedIcon] = useState('💪')
  const [showHabitForm, setShowHabitForm] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [recentMonths, setRecentMonths] = useState<string[]>([])

  // Load recent planner months
  useEffect(() => {
    const loadRecentMonths = async () => {
      try {
        const { data, error } = await supabase
          .from('monthly_planners')
          .select('month')
          .eq('user_id', userId)
          .order('month', { ascending: false })
          .limit(6)

        if (error) throw error

        if (data) {
          setRecentMonths(data.map(d => d.month))
        }
      } catch (error) {
        console.error('Error loading recent months:', error)
      }
    }

    loadRecentMonths()
  }, [userId, saveSuccess])

  useEffect(() => {
    loadMonthData()
    loadHabits()
  }, [currentMonth, userId])

  function getFirstDayOfMonth(date: Date): string {
    return new Date(date.getFullYear(), date.getMonth(), 1).toISOString().split('T')[0]
  }

  const loadMonthData = async () => {
    setIsLoading(true)
    try {
      const monthStr = getFirstDayOfMonth(currentMonth)
      
      const { data, error } = await supabase
        .from('monthly_planners')
        .select('*')
        .eq('user_id', userId)
        .eq('month', monthStr)
        .single()

      if (error && error.code !== 'PGRST116') {
        console.error('Error loading planner:', error)
        return
      }

      if (data) {
        setPlannerData({
          id: data.id,
          month: data.month,
          focus_theme: data.focus_theme || '',
          goals: data.goals || [],
          priorities: data.priorities || [],
          notes: data.notes || '',
          gratitude_list: data.gratitude_list || [],
        })
      } else {
        setPlannerData({
          month: monthStr,
          focus_theme: '',
          goals: [],
          priorities: [],
          notes: '',
          gratitude_list: [],
        })
      }
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const loadHabits = async () => {
    try {
      const monthStr = getFirstDayOfMonth(currentMonth)
      
      const { data, error } = await supabase
        .from('habit_tracker')
        .select('*')
        .eq('user_id', userId)
        .eq('month', monthStr)

      if (error) throw error

      setHabits(data || [])
    } catch (error) {
      console.error('Error loading habits:', error)
    }
  }

  const savePlannerData = async (updatedData: Partial<PlannerData> = {}) => {
    setIsSaving(true)
    setSaveSuccess(false)
    try {
      // ALWAYS use first day of current month - don't trust state or updatedData
      const correctMonth = getFirstDayOfMonth(currentMonth)
      
      // Merge data explicitly without month
      const mergedData = { 
        ...plannerData, 
        ...updatedData 
      }
      
      const dataToSave = {
        user_id: userId,
        month: correctMonth,  // Set month FIRST with correct value
        focus_theme: mergedData.focus_theme || null,
        goals: mergedData.goals || [],
        priorities: mergedData.priorities || [],
        notes: mergedData.notes || null,
        gratitude_list: mergedData.gratitude_list || [],
      }

      console.log('Saving planner with month:', correctMonth, dataToSave)

      const { data, error } = await supabase
        .from('monthly_planners')
        .upsert(dataToSave, { onConflict: 'user_id,month' })
        .select()
        .single()

      if (error) {
        console.error('Supabase error:', error)
        throw error
      }

      if (data) {
        setPlannerData(prev => ({ ...prev, id: data.id, month: correctMonth }))
        setSaveSuccess(true)
        setTimeout(() => setSaveSuccess(false), 3000)
      }
    } catch (error: any) {
      console.error('Error saving planner:', error)
      alert(`Failed to save: ${error.message || 'Please check database setup'}`)
    } finally {
      setIsSaving(false)
    }
  }

  const addGoal = () => {
    if (newGoal.trim()) {
      const updated = [...plannerData.goals, newGoal.trim()]
      setPlannerData(prev => ({ ...prev, goals: updated }))
      setNewGoal('')
    }
  }

  const removeGoal = (index: number) => {
    const updated = plannerData.goals.filter((_, i) => i !== index)
    setPlannerData(prev => ({ ...prev, goals: updated }))
  }

  const addPriority = () => {
    if (newPriority.trim() && plannerData.priorities.length < 5) {
      const updated = [...plannerData.priorities, newPriority.trim()]
      setPlannerData(prev => ({ ...prev, priorities: updated }))
      setNewPriority('')
    }
  }

  const removePriority = (index: number) => {
    const updated = plannerData.priorities.filter((_, i) => i !== index)
    setPlannerData(prev => ({ ...prev, priorities: updated }))
  }

  const addGratitude = () => {
    if (newGratitude.trim()) {
      const updated = [...plannerData.gratitude_list, newGratitude.trim()]
      setPlannerData(prev => ({ ...prev, gratitude_list: updated }))
      setNewGratitude('')
    }
  }

  const removeGratitude = (index: number) => {
    const updated = plannerData.gratitude_list.filter((_, i) => i !== index)
    setPlannerData(prev => ({ ...prev, gratitude_list: updated }))
  }

  const addHabit = async () => {
    if (newHabit.trim()) {
      try {
        const { data, error } = await supabase
          .from('habit_tracker')
          .insert({
            user_id: userId,
            habit_name: newHabit.trim(),
            habit_icon: selectedIcon,
            month: getFirstDayOfMonth(currentMonth),
            tracked_dates: [],
          })
          .select()
          .single()

        if (error) throw error

        setHabits(prev => [...prev, data])
        setNewHabit('')
        setShowHabitForm(false)
      } catch (error) {
        console.error('Error adding habit:', error)
      }
    }
  }

  const toggleHabitDate = async (habitId: string, date: string) => {
    const habit = habits.find(h => h.id === habitId)
    if (!habit) return

    const dateExists = habit.tracked_dates.includes(date)
    const updatedDates = dateExists
      ? habit.tracked_dates.filter(d => d !== date)
      : [...habit.tracked_dates, date]

    try {
      const { error } = await supabase
        .from('habit_tracker')
        .update({ tracked_dates: updatedDates })
        .eq('id', habitId)

      if (error) throw error

      setHabits(prev => prev.map(h => 
        h.id === habitId ? { ...h, tracked_dates: updatedDates } : h
      ))
    } catch (error) {
      console.error('Error updating habit:', error)
    }
  }

  const deleteHabit = async (habitId: string) => {
    try {
      const { error } = await supabase
        .from('habit_tracker')
        .delete()
        .eq('id', habitId)

      if (error) throw error

      setHabits(prev => prev.filter(h => h.id !== habitId))
    } catch (error) {
      console.error('Error deleting habit:', error)
    }
  }

  const changeMonth = (direction: 'prev' | 'next') => {
    const newMonth = new Date(currentMonth)
    if (direction === 'prev') {
      newMonth.setMonth(newMonth.getMonth() - 1)
    } else {
      newMonth.setMonth(newMonth.getMonth() + 1)
    }
    setCurrentMonth(newMonth)
  }

  const getDaysInMonth = () => {
    const year = currentMonth.getFullYear()
    const month = currentMonth.getMonth()
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    const firstDay = new Date(year, month, 1).getDay()
    
    return { daysInMonth, firstDay }
  }

  const monthName = currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="text-white text-lg">Loading planner...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Month Navigation with Recent History */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/10 backdrop-blur-md rounded-2xl p-4 shadow-lg border border-white/20 space-y-4"
      >
        <div className="flex items-center justify-between">
          <button
            onClick={() => changeMonth('prev')}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <ChevronLeft size={24} className="text-white" />
          </button>
          
          <h2 className="text-2xl font-bold text-white">
            📅 {monthName}
          </h2>
          
          <button
            onClick={() => changeMonth('next')}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <ChevronRight size={24} className="text-white" />
          </button>
        </div>

        {/* Recent Planner Months */}
        {recentMonths.length > 0 && (
          <div className="space-y-2">
            <p className="text-white/60 text-xs font-medium">Recent planners:</p>
            <div className="flex gap-2 flex-wrap">
              {recentMonths.map(month => {
                const monthDate = new Date(month + 'T00:00:00')
                const isActive = getFirstDayOfMonth(currentMonth) === month
                return (
                  <button
                    key={month}
                    onClick={() => setCurrentMonth(monthDate)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      isActive
                        ? 'bg-purple-500 text-white shadow-lg'
                        : 'bg-white/20 text-white/80 hover:bg-white/30'
                    }`}
                  >
                    {monthDate.toLocaleDateString('en-US', {
                      month: 'short',
                      year: 'numeric'
                    })}
                  </button>
                )
              })}
            </div>
          </div>
        )}
      </motion.div>

      {/* Focus Theme */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-gradient-to-r from-pink-200 to-purple-200 rounded-3xl p-6 shadow-lg"
      >
        <label className="block text-gray-800 font-bold mb-2">Focus this month:</label>
        <input
          type="text"
          value={plannerData.focus_theme}
          onChange={(e) => setPlannerData(prev => ({ ...prev, focus_theme: e.target.value }))}
          placeholder="plan with purpose. stay positive. make it happen. ♡"
          className="w-full px-4 py-3 rounded-xl bg-white/70 border border-gray-300 text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-pink-400"
        />
      </motion.div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Big Goals This Month */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-pink-100/90 backdrop-blur-md rounded-3xl p-6 shadow-lg"
        >
          <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <span>🎯</span> Big Goals This Month
          </h3>
          
          <div className="space-y-2 mb-4 max-h-48 overflow-y-auto">
            {plannerData.goals.map((goal, index) => (
              <div key={index} className="flex items-center gap-2 bg-white/60 rounded-lg p-2">
                <span className="text-gray-800">•</span>
                <span className="flex-1 text-gray-800 text-sm">{goal}</span>
                <button
                  onClick={() => removeGoal(index)}
                  className="text-red-500 hover:text-red-700"
                >
                  <X size={16} />
                </button>
              </div>
            ))}
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              value={newGoal}
              onChange={(e) => setNewGoal(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addGoal()}
              placeholder="Add a goal..."
              className="flex-1 px-3 py-2 rounded-lg bg-white/60 border border-gray-300 text-gray-800 text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-pink-400"
            />
            <button
              onClick={addGoal}
              className="p-2 bg-pink-400 text-white rounded-lg hover:bg-pink-500 transition-colors"
            >
              <Plus size={20} />
            </button>
          </div>
        </motion.div>

        {/* Top Priorities */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-yellow-100/90 backdrop-blur-md rounded-3xl p-6 shadow-lg"
        >
          <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <span>⭐</span> Top Priorities
          </h3>
          
          <div className="space-y-2 mb-4">
            {plannerData.priorities.map((priority, index) => (
              <div key={index} className="flex items-center gap-2 bg-white/60 rounded-lg p-2">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-yellow-400 text-white text-xs flex items-center justify-center font-bold">
                  {index + 1}
                </span>
                <span className="flex-1 text-gray-800 text-sm">{priority}</span>
                <button
                  onClick={() => removePriority(index)}
                  className="text-red-500 hover:text-red-700"
                >
                  <X size={16} />
                </button>
              </div>
            ))}
          </div>

          {plannerData.priorities.length < 5 && (
            <div className="flex gap-2">
              <input
                type="text"
                value={newPriority}
                onChange={(e) => setNewPriority(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addPriority()}
                placeholder="Add priority..."
                className="flex-1 px-3 py-2 rounded-lg bg-white/60 border border-gray-300 text-gray-800 text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-400"
              />
              <button
                onClick={addPriority}
                className="p-2 bg-yellow-400 text-white rounded-lg hover:bg-yellow-500 transition-colors"
              >
                <Plus size={20} />
              </button>
            </div>
          )}
        </motion.div>
      </div>

      {/* Habit Tracker */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-purple-100/90 backdrop-blur-md rounded-3xl p-6 shadow-lg"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            <span>⭐</span> Habit Tracker
          </h3>
          <button
            onClick={() => setShowHabitForm(!showHabitForm)}
            className="p-2 bg-purple-400 text-white rounded-lg hover:bg-purple-500 transition-colors"
          >
            <Plus size={20} />
          </button>
        </div>

        {showHabitForm && (
          <div className="mb-4 p-4 bg-white/60 rounded-xl space-y-3">
            <input
              type="text"
              value={newHabit}
              onChange={(e) => setNewHabit(e.target.value)}
              placeholder="Habit name..."
              className="w-full px-3 py-2 rounded-lg bg-white border border-gray-300 text-gray-800 text-sm"
            />
            
            <div className="flex gap-2">
              {HABIT_ICONS.map(icon => (
                <button
                  key={icon}
                  onClick={() => setSelectedIcon(icon)}
                  className={`p-2 text-2xl rounded-lg ${
                    selectedIcon === icon ? 'bg-purple-300 ring-2 ring-purple-400' : 'bg-white'
                  }`}
                >
                  {icon}
                </button>
              ))}
            </div>

            <div className="flex gap-2">
              <button
                onClick={addHabit}
                className="flex-1 px-4 py-2 bg-purple-400 text-white rounded-lg hover:bg-purple-500"
              >
                Add Habit
              </button>
              <button
                onClick={() => setShowHabitForm(false)}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        <div className="space-y-3">
          {habits.map(habit => (
            <div key={habit.id} className="bg-white/60 rounded-xl p-3">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{habit.habit_icon}</span>
                  <span className="font-medium text-gray-800">{habit.habit_name}</span>
                </div>
                <button
                  onClick={() => deleteHabit(habit.id)}
                  className="text-red-500 hover:text-red-700"
                >
                  <X size={16} />
                </button>
              </div>
              
              <div className="flex gap-1 flex-wrap">
                {Array.from({ length: 7 }).map((_, i) => {
                  const date = new Date(currentMonth)
                  date.setDate(date.getDate() + i)
                  const dateStr = date.toISOString().split('T')[0]
                  const isTracked = habit.tracked_dates.includes(dateStr)
                  
                  return (
                    <button
                      key={i}
                      onClick={() => toggleHabitDate(habit.id, dateStr)}
                      className={`w-8 h-8 rounded-lg text-xs font-medium transition-all ${
                        isTracked
                          ? 'bg-purple-400 text-white'
                          : 'bg-white border border-gray-300 text-gray-600 hover:bg-purple-100'
                      }`}
                    >
                      {date.getDate()}
                    </button>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Gratitude List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-green-100/90 backdrop-blur-md rounded-3xl p-6 shadow-lg"
      >
        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
          <span>💚</span> Gratitude List
        </h3>
        
        <div className="space-y-2 mb-4 max-h-48 overflow-y-auto">
          {plannerData.gratitude_list.map((item, index) => (
            <div key={index} className="flex items-center gap-2 bg-white/60 rounded-lg p-2">
              <span className="text-red-500">♥</span>
              <span className="flex-1 text-gray-800 text-sm">{item}</span>
              <button
                onClick={() => removeGratitude(index)}
                className="text-red-500 hover:text-red-700"
              >
                <X size={16} />
              </button>
            </div>
          ))}
        </div>

        <div className="flex gap-2">
          <input
            type="text"
            value={newGratitude}
            onChange={(e) => setNewGratitude(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addGratitude()}
            placeholder="I'm grateful for..."
            className="flex-1 px-3 py-2 rounded-lg bg-white/60 border border-gray-300 text-gray-800 text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-400"
          />
          <button
            onClick={addGratitude}
            className="p-2 bg-green-400 text-white rounded-lg hover:bg-green-500 transition-colors"
          >
            <Plus size={20} />
          </button>
        </div>
      </motion.div>

      {/* Notes / Brain Dump */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="bg-blue-100/90 backdrop-blur-md rounded-3xl p-6 shadow-lg"
      >
        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
          <span>📝</span> Notes / Brain Dump
        </h3>
        <textarea
          value={plannerData.notes}
          onChange={(e) => setPlannerData(prev => ({ ...prev, notes: e.target.value }))}
          placeholder="Write your thoughts, ideas, reminders..."
          rows={5}
          className="w-full px-4 py-3 rounded-xl bg-white/60 border border-gray-300 text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none"
        />
      </motion.div>

      {/* Manual Save Button */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="flex gap-3"
      >
        <button
          onClick={() => savePlannerData({})}
          disabled={isSaving}
          className="flex-1 px-6 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-2xl font-bold shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSaving ? 'Saving...' : '💾 Save Planner'}
        </button>
        
        {plannerData.id && (
          <button
            onClick={async () => {
              if (confirm('Delete this month\'s planner?')) {
                try {
                  const { error } = await supabase
                    .from('monthly_planners')
                    .delete()
                    .eq('id', plannerData.id)
                  
                  if (error) throw error
                  
                  // Reset form
                  setPlannerData({
                    month: getFirstDayOfMonth(currentMonth),
                    focus_theme: '',
                    goals: [],
                    priorities: [],
                    notes: '',
                    gratitude_list: [],
                  })
                  alert('Planner deleted!')
                } catch (error) {
                  console.error('Error deleting:', error)
                  alert('Failed to delete')
                }
              }
            }}
            className="px-6 py-4 bg-red-500 text-white rounded-2xl font-bold shadow-lg hover:bg-red-600 transition-all"
          >
            🗑️ Delete
          </button>
        )}
      </motion.div>

      {/* Save Status Toast */}
      {isSaving && (
        <div className="fixed bottom-6 right-6 bg-blue-500 text-white px-6 py-3 rounded-full shadow-lg z-50 flex items-center gap-2">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
          Saving...
        </div>
      )}
      
      {saveSuccess && !isSaving && (
        <div className="fixed bottom-6 right-6 bg-green-500 text-white px-6 py-3 rounded-full shadow-lg z-50 flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          Saved successfully!
        </div>
      )}
    </div>
  )
}
