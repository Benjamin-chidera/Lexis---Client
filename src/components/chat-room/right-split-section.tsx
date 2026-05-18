import {
  FileText,
  Link as LinkIcon,
  Zap,
  Briefcase,
  Search,
  Download,
  Globe,
  ExternalLink,
  Scale,
  BookOpen,
} from "lucide-react";
import { Button } from "../ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

export const RightSplitSection = () => {
  return (
    <main>
      <div className="flex-1 flex flex-col gap-0 overflow-hidden bg-[#0a0a0a] border border-white/5 rounded-[32px] shadow-2xl relative">
        {/* Vault Header */}
        <div className="px-8 py-6 flex items-center justify-between border-b border-white/5 bg-[#0a0a0a]/50 backdrop-blur-sm z-20">
          <div className="flex items-center gap-3">
            <Briefcase className="w-6 h-6 text-blue-400" />
            <h2 className="text-2xl font-bold text-white tracking-tight">
              Vault: Active Evidence
            </h2>
          </div>
          <div className="flex items-center gap-6">
            <span className="text-[11px] font-medium text-slate-400">
              Page 14 of 142
            </span>
            <div className="flex items-center gap-2">
              <Button
                size="icon"
                variant="ghost"
                className="h-8 w-8 text-slate-400 hover:text-white rounded-lg"
              >
                <Search className="w-4 h-4" />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                className="h-8 w-8 text-slate-400 hover:text-white rounded-lg"
              >
                <Download className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        <Tabs
          defaultValue="pdf1"
          className="flex-1 flex flex-col overflow-hidden w-full"
        >
          {/* Tabs List */}
          <div className="px-8 pt-6 pb-2 border-b border-white/5 bg-[#0a0a0a]/30 z-20">
            <TabsList className="bg-transparent border-0 p-0 h-auto gap-3 flex flex-wrap justify-start">
              <TabsTrigger
                value="pdf1"
                className="rounded-lg px-4 py-2.5 text-[11px] font-semibold tracking-wide border border-white/10 bg-white/[0.03] text-slate-400 data-[state=active]:bg-purple-900/20 data-[state=active]:border-purple-500/50 data-[state=active]:text-purple-300 transition-all shadow-sm flex items-center gap-2"
              >
                <FileText className="w-4 h-4" />
                Deposition_Witness_J.pdf
              </TabsTrigger>
              <TabsTrigger
                value="pdf2"
                className="rounded-lg px-4 py-2.5 text-[11px] font-semibold tracking-wide border border-white/10 bg-white/[0.03] text-slate-400 data-[state=active]:bg-purple-900/20 data-[state=active]:border-purple-500/50 data-[state=active]:text-purple-300 transition-all shadow-sm flex items-center gap-2"
              >
                <FileText className="w-4 h-4" />
                Contract_Exhibit_A.pdf
              </TabsTrigger>
              <TabsTrigger
                value="url1"
                className="rounded-lg px-4 py-2.5 text-[11px] font-semibold tracking-wide border border-white/10 bg-white/[0.03] text-slate-400 data-[state=active]:bg-purple-900/20 data-[state=active]:border-purple-500/50 data-[state=active]:text-purple-300 transition-all shadow-sm flex items-center gap-2"
              >
                <Globe className="w-4 h-4" />
                Legal_Precedent.gov
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Tab Content: PDF */}
          <TabsContent
            value="pdf1"
            className="flex-1 overflow-hidden m-0 data-[state=active]:flex flex-col relative"
          >
            <div className="flex-1 overflow-y-auto p-12 bg-black/80 flex justify-center custom-scrollbar scroll-smooth">
              <div className="w-full max-w-2xl bg-[#0a0a0a] shadow-[0_30px_100px_rgba(0,0,0,0.9)] p-20 rounded-md border border-white/[0.03] relative min-h-[950px] group/pdf">
                {/* Watermark/Header */}
                <div className="flex justify-between mb-20 opacity-30">
                  <span className="text-[10px] font-bold tracking-widest text-slate-500 uppercase">
                    CONFIDENTIAL / CASE 44-X912
                  </span>
                  <span className="text-[10px] font-bold tracking-widest text-slate-500 uppercase">
                    EXHIBIT B-12
                  </span>
                </div>

                <div className="space-y-12 text-slate-300 font-serif leading-[2.4] text-[15px] antialiased">
                  <div className="flex gap-4">
                    <span className="text-slate-500 font-sans font-bold text-sm mt-1.5 w-6 shrink-0">
                      Q:
                    </span>
                    <p>
                      Can you describe your whereabouts on the evening of June
                      12th?
                    </p>
                  </div>
                  <div className="flex gap-4">
                    <span className="text-slate-500 font-sans font-bold text-sm mt-1.5 w-6 shrink-0">
                      A:
                    </span>
                    <p>
                      I remember the evening clearly because we had just
                      finished the quarterly audit. I was quite exhausted from
                      the week's events.
                    </p>
                  </div>
                  <div className="flex gap-4">
                    <span className="text-slate-500 font-sans font-bold text-sm mt-1.5 w-6 shrink-0">
                      Q:
                    </span>
                    <p>And where exactly were you at approximately 8:45 PM?</p>
                  </div>

                  {/* Highlighted section */}
                  <div className="relative group/highlight -mx-8 px-8 py-6">
                    <div className="absolute inset-0 bg-cyan-500/[0.08] border border-cyan-500/30 rounded-lg shadow-[0_0_30px_rgba(6,182,212,0.15)] pointer-events-none" />
                    <div className="flex gap-4 relative z-10">
                      <span className="text-cyan-400 font-sans font-bold text-sm mt-1.5 w-6 shrink-0">
                        A:
                      </span>
                      <p className="text-white font-bold flex items-center justify-between w-full">
                        I remained in the main headquarters office until nearly
                        midnight to finalize the filing.
                        <LinkIcon className="w-4 h-4 text-cyan-400/50 ml-4 shrink-0" />
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <span className="text-slate-500 font-sans font-bold text-sm mt-1.5 w-6 shrink-0">
                      Q:
                    </span>
                    <p>Was anyone else with you at that time?</p>
                  </div>
                  <div className="flex gap-4">
                    <span className="text-slate-500 font-sans font-bold text-sm mt-1.5 w-6 shrink-0">
                      A:
                    </span>
                    <p>
                      No, the janitorial staff had left around 9:00 PM. I was
                      alone in the executive wing.
                    </p>
                  </div>
                  <div className="flex gap-4">
                    <span className="text-slate-500 font-sans font-bold text-sm mt-1.5 w-6 shrink-0">
                      Q:
                    </span>
                    <p>
                      Are you absolutely certain you did not visit 'The Vault'
                      lounge on 5th Avenue?
                    </p>
                  </div>
                  <div className="flex gap-4">
                    <span className="text-slate-500 font-sans font-bold text-sm mt-1.5 w-6 shrink-0">
                      A:
                    </span>
                    <p>
                      I am positive. I did not leave the office until my
                      rideshare arrived at 11:58 PM.
                    </p>
                  </div>
                </div>

                {/* Footer */}
                <div className="absolute bottom-16 inset-x-20 flex justify-between items-end opacity-30">
                  <div className="space-y-2">
                    <div className="w-[120%] h-[1px] bg-slate-600" />
                    <span className="text-[10px] font-bold tracking-widest uppercase text-slate-400">
                      DIGITAL SIGNATURE: HASH_91220X
                    </span>
                  </div>
                  <span className="text-[10px] font-bold tracking-widest text-slate-400 uppercase">
                    PAGE 14
                  </span>
                </div>
              </div>
            </div>

            {/* Zoom Controls */}
            <div className="absolute bottom-10 right-10 flex flex-col gap-2 z-30">
              <Button
                size="icon"
                className="w-12 h-12 rounded-full bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:bg-white/10 backdrop-blur-xl shadow-2xl transition-all"
              >
                <span className="text-xl">+</span>
              </Button>
              <Button
                size="icon"
                className="w-12 h-12 rounded-full bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:bg-white/10 backdrop-blur-xl shadow-2xl transition-all"
              >
                <span className="text-xl">-</span>
              </Button>
            </div>
          </TabsContent>

          <TabsContent
            value="pdf2"
            className="flex-1 overflow-hidden m-0 data-[state=active]:flex flex-col items-center justify-center text-slate-500 italic bg-black/80"
          >
            Loading Contract_Exhibit_A.pdf...
          </TabsContent>

          {/* Tab Content: URL Web Card Description */}
          <TabsContent
            value="url1"
            className="flex-1 overflow-y-auto m-0 data-[state=active]:flex flex-col p-12 bg-black/80 custom-scrollbar items-center"
          >
            <div className="w-full max-w-2xl mt-10">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
                  <Globe className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">
                    Extracted Web Intelligence
                  </h3>
                  <p className="text-xs text-slate-400 font-mono mt-0.5">
                    SOURCE: Legal_Precedent.gov/case/44-x912
                  </p>
                </div>
              </div>

              <Card className="bg-[#0a0a0a] border-white/10 shadow-2xl overflow-hidden rounded-2xl group">
                <div className="h-40 bg-gradient-to-br from-blue-900/40 via-slate-900 to-[#0a0c14] relative border-b border-white/5 flex items-center justify-center overflow-hidden">
                  <Scale className="w-24 h-24 text-blue-500/10 absolute -right-4 -bottom-4 rotate-12" />
                  <BookOpen className="w-16 h-16 text-white/5" />
                  <div className="absolute inset-0 bg-blue-500/5 group-hover:bg-blue-500/10 transition-colors" />
                </div>
                <div className="p-8">
                  <div className="flex items-start justify-between mb-4">
                    <Badge className="bg-blue-500/10 text-blue-400 border-blue-500/20 px-3 py-1 text-xs">
                      Federal Precedent
                    </Badge>
                    <span className="text-xs text-slate-500 font-medium">
                      Scraped 2 hours ago
                    </span>
                  </div>
                  <h2 className="text-2xl font-bold text-white mb-4 leading-tight group-hover:text-blue-300 transition-colors cursor-pointer">
                    State v. Harrison (2018) - Analysis of Digital Alibis in
                    Corporate Fraud
                  </h2>
                  <p className="text-slate-400 text-base leading-relaxed mb-6">
                    A landmark ruling establishing the threshold for digital
                    verification of alibis when standard GPS data is
                    unavailable. The court ruled that multi-factor
                    authentication logs from secure corporate networks hold
                    equivalent weight to sworn eyewitness testimony if
                    cryptographically signed and immutable.
                  </p>

                  <div className="bg-white/5 border border-white/5 rounded-xl p-5 space-y-3">
                    <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-2">
                      <Zap className="w-3.5 h-3.5 text-amber-400" />
                      Key Extracted Facts
                    </h4>
                    <ul className="space-y-2 text-sm text-slate-400">
                      <li className="flex gap-3">
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                        <p>
                          Established the "Immutable Log Standard" for corporate
                          servers.
                        </p>
                      </li>
                      <li className="flex gap-3">
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                        <p>
                          Dismissed conflicting social media check-ins as
                          "circumstantial and easily spoofed" compared to
                          enterprise access logs.
                        </p>
                      </li>
                      <li className="flex gap-3">
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                        <p>Highly relevant to Exhibit B-12 defense strategy.</p>
                      </li>
                    </ul>
                  </div>

                  <div className="mt-8 pt-6 border-t border-white/10 flex justify-between items-center">
                    <Button
                      variant="ghost"
                      className="text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 px-0 group-hover/btn:px-4 transition-all"
                    >
                      View Original Source{" "}
                      <ExternalLink className="w-4 h-4 ml-2" />
                    </Button>
                    <Button className="bg-white/10 hover:bg-white/20 text-white border border-white/5">
                      Add to Strategy Board
                    </Button>
                  </div>
                </div>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </main>
  );
};
