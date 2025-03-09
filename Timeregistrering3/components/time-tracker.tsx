"use client"

import React, { useState } from "react"
import { format, startOfWeek, addDays, addWeeks, subWeeks } from "date-fns"
import { nb } from "date-fns/locale"
import { CalendarIcon, ChevronLeft, ChevronRight, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { cn } from "@/lib/utils"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { ActivityPanel } from "@/components/activity-panel"

// Types
export type Activity = {
  id: string
  caseId: string
  day: string // ISO date string
  hours: number
  description: string
  activityType: string
  billable: boolean
  billed: boolean
}

export type Case = {
  id: string
  description: string
}

// Mock data
const mockCases: Case[] = [
  { id: "SAK 67", description: "Tvangfravikelse" },
  { id: "SAK 9", description: "Drap" },
  { id: "SAK 8", description: "Overprøving Tingretten" },
  { id: "SAK 266", description: "Erstatsningkrav" },
]

const activityTypes = [
  "Juridisk Bistand",
  "Forhandlinger",
  "Kommunikasjon",
  "Undersøkelse",
  "Reisetid ",
  "Mekling",
  "Kontraksgjennomgang",
  "Admin",
]

const initialActivities: Activity[] = [
  {
    id: "1",
    caseId: "Sak 67",
    day: "2025-03-03", // Monday
    hours: 2.5,
    description: "Tvangsfravikelse",
    activityType: "Review",
    billable: true,
    billed: true,
  },
  {
    id: "2",
    caseId: "SAK 9",
    day: "2025-03-04", // Tuesday
    hours: 1.75,
    description: "Drap",
    activityType: "Meeting",
    billable: true,
    billed: false,
  },
  {
    id: "3",
    caseId: "SAK 8",
    day: "2025-03-03", // Monday
    hours: 3,
    description: "Overprøving Tingretten",
    activityType: "Research",
    billable: true,
    billed: false,
  },
  {
    id: "4",
    caseId: "SAK 266",
    day: "2025-03-05", // Wednesday
    hours: 1.25,
    description: "Tvangsfravikelse",
    activityType: "Drafting",
    billable: true,
    billed: false,
  },
]

export default function TimeTracker() {
  // State
  const [currentWeek, setCurrentWeek] = useState<Date>(startOfWeek(new Date(), { weekStartsOn: 1 }))
  const [activities, setActivities] = useState<Activity[]>(initialActivities)
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null)
  const [calendarOpen, setCalendarOpen] = useState(false)
  const [newActivityMode, setNewActivityMode] = useState(false)
  const [selectedDay, setSelectedDay] = useState<string | null>(null)
  const [selectedCase, setSelectedCase] = useState<string | null>(null)

  // Form state for quick logging
  const [newActivity, setNewActivity] = useState({
    day: format(new Date(), "EEEE", { locale: nb }),
    caseId: "",
    activityType: "",
    description: "",
    hours: 0.25,
    billed: false,
  })

  // Generate weekdays for the current week
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const day = addDays(currentWeek, i)
    return {
      date: day,
      dayName: format(day, "EEEE", { locale: nb }).toUpperCase(),
      dayShort: format(day, "EEE", { locale: nb }).toUpperCase(),
      dayNumber: format(day, "d"),
      isoString: format(day, "yyyy-MM-dd"),
    }
  })

  // Handle week navigation
  const goToPreviousWeek = () => setCurrentWeek(subWeeks(currentWeek, 1))
  const goToNextWeek = () => setCurrentWeek(addWeeks(currentWeek, 1))
  const goToWeek = (date: Date) => {
    setCurrentWeek(startOfWeek(date, { weekStartsOn: 1 }))
    setCalendarOpen(false)
  }

  // Handle quick activity logging
  const handleAddActivity = () => {
    if (!newActivity.caseId || !newActivity.activityType || newActivity.hours <= 0) return

    const selectedDayObj = weekDays.find((day) => day.dayName === newActivity.day)
    if (!selectedDayObj) return

    const newActivityEntry: Activity = {
      id: Date.now().toString(),
      caseId: newActivity.caseId,
      day: selectedDayObj.isoString,
      hours: newActivity.hours,
      description: newActivity.description,
      activityType: newActivity.activityType,
      billable: true, // Default to billable
      billed: newActivity.billed,
    }

    // Add the new activity and sort them by day
    setActivities(
      [...activities, newActivityEntry].sort((a, b) => new Date(a.day).getTime() - new Date(b.day).getTime()),
    )

    // Reset form except for the selected day and case
    setNewActivity({
      ...newActivity,
      activityType: "",
      description: "",
      hours: 0.25,
      billed: false,
    })

    // Scroll to the case in the table
    setTimeout(() => {
      const caseElement = document.getElementById(`case-${newActivity.caseId}`)
      if (caseElement) {
        caseElement.scrollIntoView({ behavior: "smooth", block: "center" })
      }
    }, 100)
  }

  // Handle activity selection for editing
  const handleActivityClick = (activity: Activity) => {
    setSelectedActivity(activity)
    setNewActivityMode(false)
    setSelectedDay(null)
    setSelectedCase(null)
  }

  // Handle empty cell click
  const handleEmptyCellClick = (day: string, caseId: string) => {
    setSelectedActivity(null)
    setNewActivityMode(true)
    setSelectedDay(day)
    setSelectedCase(caseId)
  }

  // Handle activity update
  const handleUpdateActivity = (updatedActivity: Activity) => {
    setActivities(activities.map((activity) => (activity.id === updatedActivity.id ? updatedActivity : activity)))
    setSelectedActivity(null)
    setNewActivityMode(false)
  }

  // Handle activity deletion
  const handleDeleteActivity = (activityId: string) => {
    setActivities(activities.filter((activity) => activity.id !== activityId))
    setSelectedActivity(null)
    setNewActivityMode(false)
  }

  // Handle new activity creation
  const handleCreateActivity = (newActivity: Omit<Activity, "id">) => {
    const newActivityEntry: Activity = {
      ...newActivity,
      id: Date.now().toString(),
    }

    setActivities([...activities, newActivityEntry])
    setNewActivityMode(false)
    setSelectedDay(null)
    setSelectedCase(null)
  }

  // Handle submit week
  const handleSubmitWeek = () => {
    // In a real application, this would send the data to a server
    alert(" Submitted!")
  }

  // Calculate total hours for each day
  const getDayTotalHours = (dayIsoString: string) => {
    return activities
      .filter((activity) => activity.day === dayIsoString)
      .reduce((sum, activity) => sum + activity.hours, 0)
  }

  // Close all panels
  const handleClosePanel = () => {
    setSelectedActivity(null)
    setNewActivityMode(false)
    setSelectedDay(null)
    setSelectedCase(null)
  }

  return (
    <div className="container mx-auto py-6 space-y-8">
      {/* Header Section - Quick Activity Logging */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold mb-4">Timeregistrering</h2>
        <div className="grid grid-cols-1 md:grid-cols-7 gap-4 items-end">
          {/* Weekday Selector */}
          <div>
            <label className="block text-sm font-medium mb-1">Dag</label>
            <Select value={newActivity.day} onValueChange={(value) => setNewActivity({ ...newActivity, day: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Velg Dag" />
              </SelectTrigger>
              <SelectContent>
                {weekDays.map((day) => (
                  <SelectItem key={day.isoString} value={day.dayName}>
                    {day.dayName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Case Selector */}
          <div>
            <label className="block text-sm font-medium mb-1">Sak</label>
            <Select
              value={newActivity.caseId}
              onValueChange={(value) => setNewActivity({ ...newActivity, caseId: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Velg Sak" />
              </SelectTrigger>
              <SelectContent>
                {mockCases.map((caseItem) => (
                  <SelectItem key={caseItem.id} value={caseItem.id}>
                    {caseItem.id} - {caseItem.description}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Activity Type */}
          <div>
            <label className="block text-sm font-medium mb-1">Aktivitet</label>
            <Select
              value={newActivity.activityType}
              onValueChange={(value) => setNewActivity({ ...newActivity, activityType: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Velg Aktivitet" />
              </SelectTrigger>
              <SelectContent>
                {activityTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium mb-1">Beskrivelse</label>
            <Input
              value={newActivity.description}
              onChange={(e) => setNewActivity({ ...newActivity, description: e.target.value })}
              placeholder="Beskrivelse"
            />
          </div>

          {/* Time Tracker */}
          <div>
            <label className="block text-sm font-medium mb-1">Timer</label>
            <div className="flex items-center">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setNewActivity({ ...newActivity, hours: Math.max(0.25, newActivity.hours - 0.25) })}
                className="h-10 w-10"
              >
                -
              </Button>
              <div className="w-16 text-center font-medium">{newActivity.hours.toFixed(2)}</div>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setNewActivity({ ...newActivity, hours: newActivity.hours + 0.25 })}
                className="h-10 w-10"
              >
                +
              </Button>
            </div>
          </div>

          {/* Billed Checkbox */}
          <div>
            <label className="block text-sm font-medium mb-1">Fakturert</label>
            <div className="flex items-center h-10">
              <Checkbox
                id="quick-billed"
                checked={newActivity.billed}
                onCheckedChange={(checked) => setNewActivity({ ...newActivity, billed: checked === true })}
              />
              <label htmlFor="quick-billed" className="ml-2 text-sm">
                Fakturert
              </label>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-2">
            <Button onClick={handleAddActivity} className="bg-green-600 hover:bg-green-700 text-white">
              LeggTil
            </Button>
            <Button onClick={handleSubmitWeek} className="bg-blue-800 hover:bg-blue-900 text-white">
              Send inn uke
            </Button>
          </div>
        </div>

        {/* Week Navigation */}
        <div className="flex items-center justify-between mt-6">
          <div className="text-lg font-medium">
             {format(currentWeek, "MMMM", { locale: nb }).toUpperCase()}{" "}
            {format(currentWeek, "d, yyyy", { locale: nb })}
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="icon" onClick={goToPreviousWeek}>
              <ChevronLeft className="h-4 w-4" />
            </Button>

            <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
              <PopoverTrigger asChild>
                <Button variant="outline" size="icon">
                  <CalendarIcon className="h-4 w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={currentWeek}
                  onSelect={(date) => date && goToWeek(date)}
                  initialFocus
                  locale={nb}
                />
              </PopoverContent>
            </Popover>

            <Button variant="outline" size="icon" onClick={goToNextWeek}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Main Table - Activity Overview */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-100">
                <th className="py-3 px-4 text-left font-medium text-gray-700 w-1/4">Sak</th>
                {weekDays.map((day) => (
                  <th key={day.isoString} className="py-3 px-4 text-center font-medium text-gray-700">
                    <div>{day.dayShort}</div>
                    <div className="text-sm">{day.dayNumber}</div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {/* Expected Hours Row */}
              <tr className="border-t border-gray-200">
                <td className="py-3 px-4 font-medium text-gray-400">Forventedet Timer</td>
                {weekDays.map((day) => (
                  <td key={day.isoString} className="py-3 px-4 text-center font-medium text-gray-400">
                    8.0
                  </td>
                ))}
              </tr>

              {/* Actual Hours Row */}
              <tr className="border-t border-gray-200 bg-gray-50">
                <td className="py-3 px-4 font-medium text-gray-400">Faktiske Timer</td>
                {weekDays.map((day) => {
                  const totalHours = getDayTotalHours(day.isoString)
                  return (
                    <td
                      key={day.isoString}
                      className={cn(
                        "py-3 px-4 text-center font-medium",
                        totalHours < 8
                          ? "text-red-500/70"
                          : totalHours > 8
                            ? "text-orange-500/70"
                            : "text-green-500/70",
                      )}
                    >
                      {totalHours.toFixed(1)}
                    </td>
                  )
                })}
              </tr>

              {/* Divider */}
              <tr>
                <td colSpan={8} className="border-t-2 border-gray-300"></td>
              </tr>

              {mockCases.map((caseItem) => {
                const caseActivities = activities.filter((activity) => activity.caseId === caseItem.id)

                return (
                  <React.Fragment key={caseItem.id}>
                    {/* Case Header */}
                    <tr className="border-t border-gray-200" id={`case-${caseItem.id}`}>
                      <td className="py-3 px-4">
                        <div className="font-medium">{caseItem.id}</div>
                        <div className="text-sm text-gray-500">{caseItem.description}</div>
                      </td>

                      {weekDays.map((day) => {
                        const dayActivities = caseActivities.filter((activity) => activity.day === day.isoString)

                        if (dayActivities.length === 0) {
                          return (
                            <td key={day.isoString} className="py-3 px-4 text-center">
                              <button
                                onClick={() => handleEmptyCellClick(day.isoString, caseItem.id)}
                                className="w-full h-16 border-2 border-dashed border-gray-300 rounded flex items-center justify-center text-gray-400 hover:text-gray-600 hover:border-gray-400 transition-colors"
                              >
                                <span className="text-xl">+</span>
                              </button>
                            </td>
                          )
                        }

                        const firstActivity = dayActivities[0]
                        return (
                          <td key={`${day.isoString}-${firstActivity.id}`} className="py-3 px-4 text-center">
                            <button
                              onClick={() => handleActivityClick(firstActivity)}
                              className={cn(
                                "w-full p-2 rounded text-center",
                                firstActivity.billable ? "bg-green-100" : "bg-yellow-100",
                                selectedActivity?.id === firstActivity.id ? "ring-2 ring-blue-500" : "",
                              )}
                            >
                              <div className="text-xl font-medium">{firstActivity.hours.toFixed(1)}</div>
                              <div className="text-sm truncate max-w-[120px]">{firstActivity.description}</div>
                              {firstActivity.billed && (
                                <div className="flex justify-center mt-1">
                                  <Check className="h-4 w-4 text-green-600" />
                                </div>
                              )}
                            </button>
                          </td>
                        )
                      })}
                    </tr>

                    {/* Additional Activities (no borders between activities) */}
                    {weekDays.map((day) => {
                      const dayActivities = caseActivities.filter((activity) => activity.day === day.isoString).slice(1)

                      return dayActivities.map((activity) => (
                        <tr key={activity.id}>
                          <td className="py-3 px-4"></td>
                          {weekDays.map((innerDay) => (
                            <td key={innerDay.isoString} className="py-3 px-4 text-center">
                              {innerDay.isoString === day.isoString ? (
                                <button
                                  onClick={() => handleActivityClick(activity)}
                                  className={cn(
                                    "w-full p-2 rounded text-center",
                                    activity.billable ? "bg-green-100" : "bg-yellow-100",
                                    selectedActivity?.id === activity.id ? "ring-2 ring-blue-500" : "",
                                  )}
                                >
                                  <div className="text-xl font-medium">{activity.hours.toFixed(1)}</div>
                                  <div className="text-sm truncate max-w-[120px]">{activity.description}</div>
                                  {activity.billed && (
                                    <div className="flex justify-center mt-1">
                                      <Check className="h-4 w-4 text-green-600" />
                                    </div>
                                  )}
                                </button>
                              ) : null}
                            </td>
                          ))}
                        </tr>
                      ))
                    })}

                    {/* Activity Panel Row - Shows for both editing and adding */}
                    {((selectedActivity && selectedActivity.caseId === caseItem.id) ||
                      (newActivityMode && selectedCase === caseItem.id)) && (
                      <tr>
                        <td colSpan={8} className="border-t border-gray-200">
                          <div className="p-4 bg-gray-50">
                            <ActivityPanel
                              activity={selectedActivity}
                              isNewMode={newActivityMode}
                              selectedDay={selectedDay}
                              selectedCase={selectedCase}
                              cases={mockCases}
                              activityTypes={activityTypes}
                              onUpdate={handleUpdateActivity}
                              onDelete={handleDeleteActivity}
                              onCreate={handleCreateActivity}
                              onClose={handleClosePanel}
                            />
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

