import { LeftSplitSection } from "@/components/chat-room/left-split-section";
import { RightSplitSection } from "@/components/chat-room/right-split-section";

const ChatRoomPage = () => {
  return (
    <div className="h-screen bg-black overflow-hidden text-slate-200 flex flex-col font-sans  selection:bg-purple-500/30">
      {/* Background Decorative Glows */}
      {/* <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-900/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[10%] right-[-5%] w-[30%] h-[30%] bg-blue-900/5 rounded-full blur-[100px] pointer-events-none" /> */}

      {/* Main Container */}
      <div className="flex flex-1 overflow-hidden p-6 gap-6 relative z-10">
        {/* Left Column: Intelligence Stream */}
        <LeftSplitSection />

        {/* Right Column: Vault / Evidence */}
        <RightSplitSection />
      </div>

      {/* Floating Alert Modal */}
      {/* <div className="fixed bottom-32 left-[calc(50%-120px)] z-50">
        <div className="group bg-[#0a0a0a]/95 border border-white/10 p-4 pr-6 rounded-[16px] flex items-center gap-4 backdrop-blur-2xl shadow-[0_30px_60px_rgba(0,0,0,0.7)] animate-in fade-in slide-in-from-bottom-10 duration-700">
          <div className="w-10 h-10 rounded-xl bg-pink-500/10 flex items-center justify-center border border-pink-500/20">
            <Search className="w-5 h-5 text-pink-400" />
          </div>
          <div>
            <h4 className="text-[10px] font-black text-pink-400 uppercase tracking-widest mb-0.5">
              Deep Dig Alert
            </h4>
            <p className="text-xs text-slate-300">
              Associate found a{" "}
              <span className="text-white font-bold">
                conflicting social media post
              </span>{" "}
              from the plaintiff.{" "}
              <span className="text-slate-400 hover:text-white cursor-pointer transition-colors ml-1">
                Tap to review.
              </span>
            </p>
          </div>
          <Button
            size="icon"
            variant="ghost"
            className="h-8 w-8 text-slate-600 hover:text-white hover:bg-white/5 rounded-lg ml-2"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div> */}

      {/* Bottom Navigation */}
   

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.1);
        }
      `}</style>
    </div>
  );
};

export default ChatRoomPage;
