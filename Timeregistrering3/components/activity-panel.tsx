"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { Activity, Case } from "@/components/time-tracker"

interface ActivityPanelProps {
  activity: Activity | null
  isNewMode: boolean
  selectedDay: string | null
  selectedCase: string | null
  cases: Case[]
  activityTypes: string[]
  onUpdate: (activity: Activity) => void
  onDelete: (activityId: string) => void
  onCreate: (activity: Omit<Activity, "id">) => void
  onClose: () => void
}

export function ActivityPanel({
  activity,
  isNewMode,
  selectedDay,
  selectedCase,
  cases,
  activityTypes,
  onUpdate,
  onDelete,
  onCreate,
  onClose,
}: ActivityPanelProps) {
  const [formData, setFormData] = useState<Omit<Activity, "id">>({
    caseId: selectedCase || "",
    day: selectedDay || "",
    hours: 0.25,
    description: "",
    activityType: "",
    billable: true,
    billed: false,
  })

  // Update form data when props change
  useEffect(() => {
    if (isNewMode) {
      setFormData({
        caseId: selectedCase || "",
        day: selectedDay || "",
        hours: 0.25,
        description: "",
        activityType: "",
        billable: true,
        billed: false,
      })
    } else if (activity) {
      setFormData({
        caseId: activity.caseId,
        day: activity.day,
        hours: activity.hours,
        description: activity.description,
        activityType: activity.activityType,
        billable: activity.billable,
        billed: activity.billed,
      })
    }
  }, [activity, isNewMode, selectedDay, selectedCase])

  const handleHoursChange = (increment: boolean) => {
    setFormData({
      ...formData,
      hours: Math.max(0.25, formData.hours + (increment ? 0.25 : -0.25)),
    })
  }

  const handleSave = () => {
    if (isNewMode) {
      onCreate(formData)
    } else if (activity) {
      onUpdate({ ...formData, id: activity.id })
    }
  }

  const handleDelete = () => {
    if (activity) {
      onDelete(activity.id)
    }
  }

  // Find the case name
  const caseName = cases.find((c) => c.id === formData.caseId)?.description || ""

  return (
    <div className="flex flex-col space-y-4">
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-500">
          {isNewMode ? "Legg Til Detaljer" : "Rediger Detaljer"}
          {caseName && ` - ${caseName}`}
        </div>
        <Button variant="ghost" size="sm" onClick={onClose}>
          lukk
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Aktivitet</label>
          <Select
            value={formData.activityType}
            onValueChange={(value) => setFormData({ ...formData, activityType: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select activity type" />
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

        <div className="space-y-2">
          <label className="text-sm font-medium">Beskrivelse</label>
          <Input
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Beskrivelse"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Timer</label>
          <div className="flex items-center">
            <Button variant="outline" size="sm" onClick={() => handleHoursChange(false)} className="h-8 w-8">
              -
            </Button>
            <div className="w-16 text-center font-medium">{formData.hours.toFixed(2)}</div>
            <Button variant="outline" size="sm" onClick={() => handleHoursChange(true)} className="h-8 w-8">
              +
            </Button>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between pt-2">
        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="billable"
              checked={formData.billable}
              onCheckedChange={(checked) => setFormData({ ...formData, billable: checked === true })}
            />
            <label htmlFor="billable" className="text-sm">
              Fakturert
            </label>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {!isNewMode && (
            <Button variant="destructive" size="sm" onClick={handleDelete}>
              Slett
            </Button>
          )}
          <Button size="sm" onClick={handleSave} className="bg-green-500 hover:bg-green-600 text-white">
            {isNewMode ? "LeggTil" : "Oppdater"}
          </Button>
        </div>
      </div>
    </div>
  )
}

