import { Music } from "lucide-react"

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"

import TracksTable from "./TracksTable"
import AddTrackDialog from "./AddTrackDialog"

const TracksTabContent = () => {
  return (
    <Card className="bg-zinc-800/80 text-zinc-100">
        <CardHeader>
            <div className="flex items-center justify-between">
                <div>
                    <CardTitle className="flex items-center gap-2">
                        <Music className="size-5 text-emerald-500" />
                        Songs Library
                    </CardTitle>
                    <CardDescription>Manage your music tracks</CardDescription>
                </div>
                <AddTrackDialog />
            </div>
        </CardHeader>
        <CardContent>
            <TracksTable />
        </CardContent>
    </Card>
  )
}

export default TracksTabContent