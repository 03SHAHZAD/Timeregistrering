"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { Activity, Case } from "@/components/time-tracker"

interface InlineActivityEditorProps {
  activity: Activity
  cases: Case[]
  activityTypes: string[]
  onUpdate: (activity: Activity) => void
  onDelete: (activityId: string) => void
  onClose: () => void
}

export function InlineActivityEditor({
  activity,
  cases,
  activityTypes,
  onUpdate,
  onDelete,
  onClose,
}: InlineActivityEditorProps) {
  const [editedActivity, setEditedActivity] = useState<Activity>(activity)

  const handleHoursChange = (increment: boolean) => {
    setEditedActivity({
      ...editedActivity,
      hours: Math.max(0.25, editedActivity.hours + (increment ? 0.25 : -0.25)),
    })
  }

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-4 flex-1">
        <Select
          value={editedActivity.activityType}
          onValueChange={(value) => setEditedActivity({ ...editedActivity, activityType: value })}
        >
          <SelectTrigger className="w-[200px]">
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

        <Input
          value={editedActivity.description}
          onChange={(e) => setEditedActivity({ ...editedActivity, description: e.target.value })}
          placeholder="Description"
          className="flex-1"
        />
      </div>

      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={() => handleHoursChange(false)} className="h-8 w-8">
            -
          </Button>
          <span className="w-12 text-center">{editedActivity.hours.toFixed(2)}</span>
          <Button variant="outline" size="sm" onClick={() => handleHoursChange(true)} className="h-8 w-8">
            +
          </Button>
        </div>

        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="billable"
              checked={editedActivity.billable}
              onCheckedChange={(checked) => setEditedActivity({ ...editedActivity, billable: checked === true })}
            />
            <label htmlFor="billable" className="text-sm">
              Billable
            </label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="billed"
              checked={editedActivity.billed}
              onCheckedChange={(checked) => setEditedActivity({ ...editedActivity, billed: checked === true })}
            />
            <label htmlFor="billed" className="text-sm">
              Billed
            </label>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Button variant="destructive" size="sm" onClick={() => onDelete(editedActivity.id)}>
            Delete
          </Button>
          <Button
            size="sm"
            onClick={() => onUpdate(editedActivity)}
            className="bg-green-500 hover:bg-green-600 text-white"
          >
            Save
          </Button>
        </div>
      </div>
    </div>
  )
}

