import { LeftCall } from "@/components/call/left"
import { RightCall } from "@/components/call/right"

export const CallPage = () => {
  return (
    <main className="h-screen bg-black overflow-hidden text-slate-200 flex p-6 gap-6 selection:bg-purple-500/30">
        <LeftCall />
        <RightCall />
    </main>
  )
}
