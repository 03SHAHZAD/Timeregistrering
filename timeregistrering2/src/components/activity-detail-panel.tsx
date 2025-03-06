"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from "@/components/ui/sheet"
import type { Activity, Case } from "@/components/time-tracker"

interface ActivityDetailPanelProps {
  activity: Activity
  cases: Case[]
  activityTypes: string[]
  isOpen: boolean
  onClose: () => void
  onUpdate: (activity: Activity) => void
  onDelete: (activityId: string) => void
}

export function ActivityDetailPanel({
  activity,
  cases,
  activityTypes,
  isOpen,
  onClose,
  onUpdate,
  onDelete,
}: ActivityDetailPanelProps) {
  const [editedActivity, setEditedActivity] = useState<Activity>(activity)

  // Update local state when the activity prop changes
  useEffect(() => {
    setEditedActivity(activity)
  }, [activity])

  const handleHoursChange = (value: number) => {
    setEditedActivity({
      ...editedActivity,
      hours: Math.max(0.25, value),
    })
  }

  const handleSave = () => {
    onUpdate(editedActivity)
  }

  const handleDelete = () => {
    onDelete(editedActivity.id)
  }

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="sm:max-w-md">
        <SheetHeader className="pb-4">
          <SheetTitle className="text-xl">Edit Activity</SheetTitle>
        </SheetHeader>

        <div className="py-4 space-y-6">
          {/* Case Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Case</label>
            <Select
              value={editedActivity.caseId}
              onValueChange={(value) => setEditedActivity({ ...editedActivity, caseId: value })}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select case" />
              </SelectTrigger>
              <SelectContent>
                {cases.map((caseItem) => (
                  <SelectItem key={caseItem.id} value={caseItem.id}>
                    {caseItem.id} - {caseItem.description}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Activity Type */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Activity Type</label>
            <Select
              value={editedActivity.activityType}
              onValueChange={(value) => setEditedActivity({ ...editedActivity, activityType: value })}
            >
              <SelectTrigger className="w-full">
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

          {/* Description */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Description</label>
            <Input
              value={editedActivity.description}
              onChange={(e) => setEditedActivity({ ...editedActivity, description: e.target.value })}
              placeholder="Activity description"
              className="w-full"
            />
          </div>

          {/* Hours */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Hours</label>
            <div className="flex items-center">
              <Button
                variant="outline"
                size="icon"
                onClick={() => handleHoursChange(editedActivity.hours - 0.25)}
                className="h-10 w-10"
              >
                -
              </Button>
              <div className="w-20 mx-2 text-center font-medium text-xl">{editedActivity.hours.toFixed(2)}</div>
              <Button
                variant="outline"
                size="icon"
                onClick={() => handleHoursChange(editedActivity.hours + 0.25)}
                className="h-10 w-10"
              >
                +
              </Button>
            </div>
          </div>

          {/* Billable Status */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="billable"
              checked={editedActivity.billable}
              onCheckedChange={(checked) => setEditedActivity({ ...editedActivity, billable: checked === true })}
            />
            <label htmlFor="billable" className="text-sm font-medium">
              Billable
            </label>
          </div>

          {/* Billed Status */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="billed"
              checked={editedActivity.billed}
              onCheckedChange={(checked) => setEditedActivity({ ...editedActivity, billed: checked === true })}
            />
            <label htmlFor="billed" className="text-sm font-medium">
              Billed
            </label>
          </div>
        </div>

        <SheetFooter className="flex justify-between sm:justify-between pt-4">
          <Button variant="destructive" onClick={handleDelete}>
            Delete
          </Button>
          <Button onClick={handleSave} className="bg-green-600 hover:bg-green-700">
            Save Changes
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}

