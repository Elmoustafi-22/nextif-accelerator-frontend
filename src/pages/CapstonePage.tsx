import { useState, useEffect } from "react";
import axiosInstance from "../api/axiosInstance";
import { useAuthStore } from "../store/useAuthStore";
import { useToastStore } from "../store/useToastStore";
import { Loader2, Users, UserPlus, Shield, Rocket, CheckCircle2, FileUp, ExternalLink } from "lucide-react";
import { motion } from "framer-motion";

interface Team {
  _id: string;
  name: string;
  founder: { _id: string; firstName: string; lastName: string; email: string };
  members: { _id: string; firstName: string; lastName: string; email: string }[];
  segment: "SOLO" | "SEEKING_COFOUNDERS" | "COLLABORATIVE";
  track?: string;
  ideaDescription?: string;
  status: "OPEN" | "CLOSED";
}

const CapstonePage = () => {
  const { user } = useAuthStore();
  const { addToast } = useToastStore();
  const [activeTab, setActiveTab] = useState<"GUIDE" | "TEAM" | "SUBMISSIONS" | "SHORTLISTED">("GUIDE");
  const [myTeam, setMyTeam] = useState<Team | null>(null);
  const [availableTeams, setAvailableTeams] = useState<Team[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [shortlistedSubmissions, setShortlistedSubmissions] = useState<any[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);

  // Team Creation Form State
  const [isCreatingTeam, setIsCreatingTeam] = useState(false);
  const [newTeam, setNewTeam] = useState({
    name: "",
    segment: "SOLO" as "SOLO" | "SEEKING_COFOUNDERS" | "COLLABORATIVE",
    track: "Startups, technology and Innovation",
    ideaDescription: ""
  });

  // Submission Form State
  const [proposalForm, setProposalForm] = useState({
    projectTitle: "",
    problemStatement: "",
  });
  const [proposalFile, setProposalFile] = useState<File | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [pitchDeckFile, setPitchDeckFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditingProposal, setIsEditingProposal] = useState(false);
  const [isEditingPitchDeck, setIsEditingPitchDeck] = useState(false);
  const [proposalDeadline, setProposalDeadline] = useState<Date>(new Date("2026-06-03T23:59:59.999Z"));
  const [pitchDeckDeadline, setPitchDeckDeadline] = useState<Date>(new Date("2026-06-11T23:59:59.999Z"));
  const [maxGroupMembers, setMaxGroupMembers] = useState(5);

  const fetchDeadlines = async () => {
    try {
      const res = await axiosInstance.get("/capstone/deadlines");
      const list = res.data.deadlines || [];
      const proposal = list.find((d: any) => d.stage === "PROPOSAL");
      const pitch = list.find((d: any) => d.stage === "PITCH_DECK");
      if (proposal) setProposalDeadline(new Date(proposal.deadline));
      if (pitch) setPitchDeckDeadline(new Date(pitch.deadline));
    } catch (err) {
      console.error("Error fetching deadlines:", err);
    }
  };

  const fetchSettings = async () => {
    try {
      const res = await axiosInstance.get("/settings");
      if (res.data.capstoneGroupMaxMembers) {
        setMaxGroupMembers(res.data.capstoneGroupMaxMembers);
      }
    } catch (err) {
      console.error("Error fetching settings:", err);
    }
  };

  const handleEditProposalClick = () => {
    const existing = submissions.find(s => s.stage === "PROPOSAL");
    if (existing) {
      setProposalForm({
        projectTitle: existing.content.projectTitle || "",
        problemStatement: existing.content.problemStatement || "",
      });
    }
    setIsEditingProposal(true);
  };

  // Invite UI state
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isInviting, setIsInviting] = useState(false);
  const [inviteMessage, setInviteMessage] = useState<string | null>(null);

  const [invites, setInvites] = useState<any[]>([]);
  const [showLeaveModal, setShowLeaveModal] = useState(false);

  useEffect(() => {
    fetchData();
    fetchInvites();
  }, []);

  const fetchInvites = async () => {
    try {
      const res = await axiosInstance.get("/capstone/invites");
      setInvites(res.data.invites || []);
    } catch (err) {
      console.error("Error fetching invites:", err);
    }
  };

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [myTeamRes, allTeamsRes, shortlistedRes] = await Promise.allSettled([
        axiosInstance.get("/capstone/teams/me"),
        axiosInstance.get("/capstone/teams"),
        axiosInstance.get("/capstone/submissions/shortlisted"),
        fetchDeadlines(),
        fetchSettings()
      ]);

      let currentTeam = null;
      if (myTeamRes.status === "fulfilled") {
        currentTeam = myTeamRes.value.data.team;
        setMyTeam(currentTeam);
      } else {
        setMyTeam(null);
      }

      if (allTeamsRes.status === "fulfilled") {
        setAvailableTeams(allTeamsRes.value.data.teams.filter((t: Team) => t.status === "OPEN" && t.segment !== "SOLO"));
      }

      if (shortlistedRes.status === "fulfilled") {
        setShortlistedSubmissions(shortlistedRes.value.data.submissions);
      }

      if (currentTeam) {
        const subRes = await axiosInstance.get("/capstone/submissions");
        setSubmissions(subRes.data.submissions.filter((s: any) => s.team._id === currentTeam._id));
      }
    } catch (error) {
      console.error("Error fetching capstone data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axiosInstance.post("/capstone/teams", newTeam);
      setIsCreatingTeam(false);
      fetchData();
      addToast("Team created successfully!", "success");
    } catch (error) {
      addToast("Failed to create team", "error");
    }
  };

  const handleJoinTeam = async (teamId: string) => {
    try {
      await axiosInstance.post(`/capstone/teams/${teamId}/join`);
      fetchData();
      addToast("Joined team successfully!", "success");
    } catch (error: any) {
      addToast(error.response?.data?.message || "Failed to join team", "error");
    }
  };

  const acceptInvite = async (inviteId: string) => {
    try {
      await axiosInstance.post(`/capstone/invites/${inviteId}/accept`);
      addToast("Invite accepted!", "success");
      fetchData();
      fetchInvites();
    } catch (err: any) {
      addToast(err.response?.data?.message || "Failed to accept invite", "error");
    }
  };

  const rejectInvite = async (inviteId: string) => {
    try {
      await axiosInstance.post(`/capstone/invites/${inviteId}/reject`);
      addToast("Invite declined", "success");
      fetchInvites();
    } catch (err: any) {
      addToast("Failed to reject invite", "error");
    }
  };

  const handleLeaveTeam = () => {
    setShowLeaveModal(true);
  };

  const confirmLeaveTeamAction = async () => {
    try {
      await axiosInstance.post("/capstone/teams/leave");
      addToast("You have left the team", "success");
      setMyTeam(null);
      setShowLeaveModal(false);
      fetchData();
    } catch (error: any) {
      addToast(error.response?.data?.message || "Failed to leave team", "error");
    }
  };

  // Search ambassadors for invite (simple debounce)
  let searchTimer: NodeJS.Timeout | null = null;
  const searchAmbassadors = (q: string) => {
    setSearchQuery(q);
    if (searchTimer) clearTimeout(searchTimer);
    if (!q || q.trim().length < 2) {
      setSearchResults([]);
      return;
    }
    setIsSearching(true);
    searchTimer = setTimeout(async () => {
      try {
        const res = await axiosInstance.get(`/capstone/ambassadors/search?q=${encodeURIComponent(q)}`);
        setSearchResults(res.data.results || []);
      } catch (err) {
        console.error(err);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 350);
  };

  const handleInvite = async (payload: { userId?: string; email?: string }) => {
    if (!myTeam) return addToast("No team selected", "error");
    setIsInviting(true);
    setInviteMessage(null);
    try {
      await axiosInstance.post(`/capstone/teams/${myTeam._id}/invite`, payload);
      setInviteMessage("Invite sent successfully");
      setSearchResults([]);
      setSearchQuery("");
      // keep modal open to show message
      addToast("Invite sent", "success");
    } catch (err: any) {
      console.error(err);
      addToast(err.response?.data?.message || "Failed to send invite", "error");
    } finally {
      setIsInviting(false);
    }
  };

  const InviteByEmailForm: React.FC<{ onInvite: (email: string) => void; loading: boolean }> = ({ onInvite, loading }) => {
    const [email, setEmail] = useState("");
    return (
      <div className="flex items-center gap-2">
        <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="user@example.com" className="w-full p-2 border rounded-lg" />
        <button disabled={loading || !email} onClick={() => { onInvite(email); setEmail(""); }} className="px-3 py-1 bg-indigo-600 text-white rounded-md text-sm">Send</button>
      </div>
    );
  };

  const handleSubmitProposal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isEditingProposal && !proposalFile) return addToast("Please upload your proposal document", "error");

    setIsSubmitting(true);
    const formData = new FormData();
    formData.append("projectTitle", proposalForm.projectTitle);
    formData.append("problemStatement", proposalForm.problemStatement);
    if (proposalFile) formData.append("file", proposalFile);
    if (logoFile) formData.append("logo", logoFile);

    try {
      await axiosInstance.post("/capstone/submissions/proposal", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      addToast(isEditingProposal ? "Proposal updated successfully!" : "Proposal submitted successfully!", "success");
      setIsEditingProposal(false);
      fetchData();
    } catch (error: any) {
      addToast(error.response?.data?.message || "Failed to submit proposal", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitPitchDeck = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isEditingPitchDeck && !pitchDeckFile) return addToast("Please upload your pitch deck", "error");

    setIsSubmitting(true);
    const formData = new FormData();
    if (pitchDeckFile) formData.append("file", pitchDeckFile);

    try {
      await axiosInstance.post("/capstone/submissions/pitch-deck", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      addToast(isEditingPitchDeck ? "Pitch deck updated successfully!" : "Pitch deck submitted successfully!", "success");
      setIsEditingPitchDeck(false);
      fetchData();
    } catch (error: any) {
      addToast(error.response?.data?.message || "Failed to submit pitch deck", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const hasSubmittedProposal = submissions.some(s => s.stage === "PROPOSAL");
  const hasSubmittedPitchDeck = submissions.some(s => s.stage === "PITCH_DECK");
  const isFounder = myTeam?.founder._id === user?.id;

  const canEditProposal = new Date() <= proposalDeadline;
  const canEditPitchDeck = new Date() <= pitchDeckDeadline;

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      <div className="mb-2">
        <h1 className="text-2xl font-bold text-gray-900">Capstone Project</h1>
        <p className="text-gray-500 mt-1">NextIF Capstone Project Guide - 2026 Cohort</p>
      </div>

      {/* Tabs */}
      <div className="flex space-x-4 border-b border-gray-200">
        {(["GUIDE", "TEAM", "SUBMISSIONS", "SHORTLISTED"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`py-2 px-4 border-b-2 font-medium text-sm transition-colors ${activeTab === tab
              ? "border-indigo-500 text-indigo-600"
              : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
          >
            {tab === "GUIDE" ? "Guide" : tab === "TEAM" ? "My Team" : tab === "SUBMISSIONS" ? "Submissions" : "Shortlisted"}
          </button>
        ))}
      </div>


      {/* Tab Content */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        {activeTab === "GUIDE" && (
          <div className="prose max-w-none">
            <h2 className="text-xl font-bold mb-4 text-indigo-700">NEXTIF CAPSTONE PROJECT GUIDE – 2026 COHORT</h2>

            <section className="mb-8">
              <h3 className="font-semibold text-lg mt-6 border-b pb-2">1. Purpose of the Capstone</h3>
              <p className="mt-2 text-gray-700">The capstone project is the final applied learning component of the mentorship cycle. Participants are expected to translate insights gained during the program into practical, research-driven, or innovation-oriented solutions within the Islamic finance ecosystem.</p>
              <p className="mt-2 text-gray-700 font-medium">Projects should demonstrate:</p>
              <ul className="list-disc pl-5 mt-2 space-y-1 text-gray-600">
                <li>Critical thinking</li>
                <li>Problem-solving ability</li>
                <li>Islamic finance relevance / Shariah compliance</li>
                <li>Innovation</li>
                <li>Feasibility</li>
                <li>Potential social or economic impact.</li>
              </ul>
            </section>

            <section className="mb-8">
              <h3 className="font-semibold text-lg mt-6 border-b pb-2">2. Capstone Project Team Formation Structure</h3>
              <div className="space-y-4 mt-4">
                <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-100">
                  <strong className="text-indigo-900">A. Solo Founder (Independent Submission)</strong>
                  <p className="text-sm text-gray-700 mt-1">For individuals who prefer to work independently. The founder takes full responsibility for developing and executing the idea.</p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg border border-green-100">
                  <strong className="text-green-900">B. Founder Seeking Co-Founders (Team Formation from Idea Owner)</strong>
                  <p className="text-sm text-gray-700 mt-1">For founders open to building a team (up to {maxGroupMembers} members). The founder invites interested participants to join as co-founders.</p>
                </div>
                <div className="bg-amber-50 p-4 rounded-lg border border-amber-100">
                  <strong className="text-amber-900">C. Collaborative Interest Group (Shared Interest Participation)</strong>
                  <p className="text-sm text-gray-700 mt-1">For individuals exploring an area of interest. Participants with similar interests form teams organically.</p>
                </div>
              </div>
            </section>

            <section className="mb-8 text-center p-6 bg-indigo-50 rounded-xl border border-indigo-100">
              <h3 className="font-bold text-indigo-900 mb-4">Evaluation Criteria & Passing Score</h3>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-2 mb-4">
                <div className="bg-white p-2 rounded shadow-sm text-xs font-bold text-indigo-600">Relevance (25%)</div>
                <div className="bg-white p-2 rounded shadow-sm text-xs font-bold text-indigo-600">Innovation (25%)</div>
                <div className="bg-white p-2 rounded shadow-sm text-xs font-bold text-indigo-600">Clarity (20%)</div>
                <div className="bg-white p-2 rounded shadow-sm text-xs font-bold text-indigo-600">Feasibility (15%)</div>
                <div className="bg-white p-2 rounded shadow-sm text-xs font-bold text-indigo-600">Presentation (15%)</div>
              </div>
              <p className="font-bold text-green-700">Minimum Passing Score: 70%</p>
            </section>
          </div>
        )}

        {activeTab === "TEAM" && (
          <div className="space-y-8">
            {isLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="animate-spin text-indigo-600" size={32} />
              </div>
            ) : myTeam ? (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">My Team: {myTeam.name}</h2>
                    <p className="text-xs text-slate-500 mt-1 uppercase tracking-widest font-bold opacity-70">Team Management Dashboard</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-3">
                    {isFounder && (
                      <button 
                        onClick={() => setShowInviteModal(true)} 
                        className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-black uppercase tracking-widest shadow-lg shadow-indigo-600/20 hover:bg-indigo-700 hover:scale-[1.02] active:scale-95 transition-all flex items-center gap-2 cursor-pointer"
                      >
                        <UserPlus size={18} />
                        Invite Member
                      </button>
                    )}
                    {!isFounder && (
                      <button 
                        onClick={handleLeaveTeam} 
                        className="px-6 py-2.5 bg-white text-red-600 border-2 border-red-100 hover:border-red-600 rounded-xl text-sm font-black uppercase tracking-widest hover:bg-red-50 hover:scale-[1.02] active:scale-95 transition-all flex items-center gap-2 cursor-pointer"
                      >
                        <Rocket size={18} className="rotate-180" />
                        Leave Team
                      </button>
                    )}
                    <span className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] shadow-sm ${myTeam.segment === "SOLO" ? "bg-indigo-100 text-indigo-700 border border-indigo-200" :
                      myTeam.segment === "SEEKING_COFOUNDERS" ? "bg-green-100 text-green-700 border border-green-200" :
                        "bg-amber-100 text-amber-700 border border-amber-200"
                      }`}>
                      {myTeam.segment.replace("_", " ")}
                    </span>
                  </div>
                </div>

                <div className="grid md:grid-cols-3 gap-6">
                  <div className="md:col-span-2 space-y-6">
                    <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
                      <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <Rocket size={20} className="text-indigo-600" />
                        Project Details
                      </h3>
                      <div className="space-y-4">
                        <div>
                          <label className="text-xs font-medium text-gray-500 uppercase">Track</label>
                          <p className="text-gray-900">{myTeam.track || "Not specified"}</p>
                        </div>
                        <div>
                          <label className="text-xs font-medium text-gray-500 uppercase">Idea Description</label>
                          <p className="text-gray-700 mt-1">{myTeam.ideaDescription || "No description provided yet."}</p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white p-6 rounded-xl border border-gray-200">
                      <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <Users size={20} className="text-indigo-600" />
                        Team Members ({myTeam.members.length}/{maxGroupMembers})
                      </h3>
                      <div className="divide-y divide-gray-100">
                        {myTeam.members.map((member) => (
                          <div key={member._id} className="py-3 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold">
                                {member.firstName[0]}{member.lastName[0]}
                              </div>
                              <div>
                                <p className="font-medium text-gray-900">{member.firstName} {member.lastName}</p>
                                <p className="text-sm text-gray-500">{member.email}</p>
                              </div>
                            </div>
                            {member._id === myTeam.founder._id && (
                              <span className="text-[10px] bg-indigo-600 text-white px-2 py-0.5 rounded-full uppercase font-bold tracking-wider">Founder</span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="bg-indigo-600 p-6 rounded-xl text-white">
                      <Shield size={24} className="mb-4" />
                      <h3 className="font-bold text-lg mb-2">Team Lead Responsibilities</h3>
                      <ul className="text-sm text-indigo-100 space-y-2">
                        <li>• Coordination & Communication</li>
                        <li>• Submission Management</li>
                        <li>• Presentation Prep</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-12">
                {/* Pending Team Invites */}
                {invites.length > 0 && (
                  <div className="bg-indigo-50 p-6 rounded-2xl border border-indigo-100 shadow-sm animate-in slide-in-from-top duration-500">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 bg-indigo-600 rounded-lg text-white">
                        <Users size={20} />
                      </div>
                      <h3 className="text-xl font-bold text-indigo-900">Pending Team Invitations</h3>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                      {invites.map(inv => (
                        <div key={inv._id} className="bg-white p-5 rounded-xl border border-indigo-100 shadow-sm flex flex-col justify-between">
                          <div>
                            <h4 className="font-bold text-gray-900 text-lg mb-1">{inv.team.name}</h4>
                            <p className="text-xs text-gray-500 mb-4 flex items-center gap-1">
                              <Shield size={12} /> Invited by {inv.inviter.firstName} {inv.inviter.lastName}
                            </p>
                          </div>
                          <div className="flex gap-2 mt-2">
                            <button 
                              onClick={() => acceptInvite(inv._id)} 
                              className="flex-1 py-2 bg-indigo-600 text-white rounded-lg text-sm font-bold hover:bg-indigo-700 transition-colors shadow-sm"
                            >
                              Accept
                            </button>
                            <button 
                              onClick={() => rejectInvite(inv._id)} 
                              className="flex-1 py-2 bg-white text-gray-600 border border-gray-200 rounded-lg text-sm font-bold hover:bg-gray-50 transition-colors"
                            >
                              Reject
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="text-center max-w-2xl mx-auto">
                  <h2 className="text-3xl font-bold text-gray-900">Formation Stage</h2>
                  <p className="text-gray-600 mt-2">You are not yet part of a capstone team. You can either create your own team or join an existing one.</p>
                  <button
                    onClick={() => setIsCreatingTeam(true)}
                    className="mt-6 px-6 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-colors inline-flex items-center gap-2"
                  >
                    <UserPlus size={20} />
                    Create New Team
                  </button>
                </div>

                {isCreatingTeam && (
                  <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-200 max-w-2xl mx-auto">
                    <h3 className="text-xl font-bold text-gray-900 mb-6">Create Your Capstone Team</h3>
                    <form onSubmit={handleCreateTeam} className="space-y-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Team/Project Name</label>
                        <input
                          type="text" required
                          value={newTeam.name}
                          onChange={e => setNewTeam({ ...newTeam, name: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                          placeholder="e.g. HalalPay, Shariah Insight..."
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Formation Segment</label>
                          <select
                            value={newTeam.segment}
                            onChange={e => setNewTeam({ ...newTeam, segment: e.target.value as any })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                          >
                            <option value="SOLO">Solo Founder</option>
                            <option value="SEEKING_COFOUNDERS">Seeking Co-founders</option>
                            <option value="COLLABORATIVE">Collaborative</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Project Track</label>
                          <select
                            value={newTeam.track}
                            onChange={e => setNewTeam({ ...newTeam, track: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                          >
                            <option value="Startups, technology and Innovation">Startups & Innovation</option>
                            <option value="Academia & Research Pathways">Academia & Research</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Brief Idea Description</label>
                        <textarea
                          rows={4}
                          value={newTeam.ideaDescription}
                          onChange={e => setNewTeam({ ...newTeam, ideaDescription: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                          placeholder="Briefly describe your project goal..."
                        />
                      </div>

                      <div className="flex gap-4">
                        <button type="submit" className="flex-1 bg-indigo-600 text-white py-3 rounded-lg font-bold hover:bg-indigo-700">Create</button>
                        <button type="button" onClick={() => setIsCreatingTeam(false)} className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-lg font-bold">Cancel</button>
                      </div>
                    </form>
                  </div>
                )}

                <div className="space-y-6">
                  <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                    <Users size={24} className="text-indigo-600" />
                    Open Teams
                  </h3>
                  {availableTeams.length > 0 ? (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {availableTeams.map(team => (
                        <div key={team._id} className="bg-white p-6 rounded-xl border border-gray-200 hover:shadow-md cursor-pointer" onClick={() => setSelectedTeam(team)}>
                          <h4 className="font-bold text-gray-900 text-lg mb-2">{team.name}</h4>
                          <p className="text-sm text-gray-600 line-clamp-2 mb-4">{team.ideaDescription}</p>
                          <div className="flex items-center justify-between mt-auto">
                            <span className="text-xs text-gray-500">{team.members.length}/{maxGroupMembers} members</span>
                            <span className="text-indigo-600 font-bold text-sm hover:underline">View Details</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-12 text-center bg-gray-50 rounded-2xl border border-dashed border-gray-300 text-gray-500">
                      No open teams available.
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === "SUBMISSIONS" && (
          <div className="space-y-8">
            {!myTeam ? (
              <div className="p-12 text-center bg-gray-50 rounded-2xl border border-dashed border-gray-300 text-gray-500">
                Join a team first.
              </div>
            ) : (
              <div className="space-y-12">
                <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                  <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">Stage I: Proposal</h3>
                      <p className="text-xs text-slate-500">Metadata + Full Document (PDF/Docx) | Deadline: {proposalDeadline.toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}</p>
                    </div>
                    {hasSubmittedProposal ? (
                      <span className="flex items-center gap-1 text-green-600 font-bold bg-green-50 px-3 py-1 rounded-full text-sm">
                        <CheckCircle2 size={16} /> Submitted
                      </span>
                    ) : (
                      <span className="text-amber-600 font-bold bg-amber-50 px-3 py-1 rounded-full text-sm">Pending</span>
                    )}
                  </div>

                  {hasSubmittedProposal && !isEditingProposal ? (
                    <div className="p-8 bg-gray-50 text-center space-y-4">
                      <p className="text-gray-600">Proposal submitted successfully.</p>
                      <div className="flex justify-center gap-4">
                        <div className="p-3 bg-white rounded-lg border border-gray-200 text-left">
                          <p className="text-xs font-bold text-slate-400 uppercase">Project</p>
                          <p className="font-bold text-slate-900">{submissions.find(s => s.stage === "PROPOSAL")?.content.projectTitle}</p>
                        </div>
                        <a
                          href={submissions.find(s => s.stage === "PROPOSAL")?.content.proposalDocUrl}
                          target="_blank" rel="noreferrer"
                          className="flex items-center gap-2 text-indigo-600 font-bold hover:underline"
                        >
                          <ExternalLink size={18} /> View Document
                        </a>
                      </div>
                      {isFounder && canEditProposal && (
                        <div className="pt-2">
                          <button
                            onClick={handleEditProposalClick}
                            className="px-6 py-2 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 transition-colors"
                          >
                            Edit Submission
                          </button>
                        </div>
                      )}
                    </div>
                  ) : isFounder ? (
                    <form onSubmit={handleSubmitProposal} className="p-6 space-y-6">
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Project Title</label>
                          <input
                            type="text" required
                            className="w-full p-2 border rounded-lg"
                            value={proposalForm.projectTitle}
                            onChange={e => setProposalForm({ ...proposalForm, projectTitle: e.target.value })}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Brief Problem Statement (Quick Review)</label>
                          <textarea
                            required
                            className="w-full p-2 border rounded-lg"
                            rows={3}
                            value={proposalForm.problemStatement}
                            onChange={e => setProposalForm({ ...proposalForm, problemStatement: e.target.value })}
                          />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="p-6 border-2 border-dashed border-indigo-100 rounded-xl bg-indigo-50/30 flex flex-col items-center">
                            <FileUp size={32} className="text-indigo-400 mb-2" />
                            <p className="text-sm font-medium text-indigo-900">Upload Project Logo (optional)</p>
                            <p className="text-xs text-slate-500 mb-4">PNG or JPG. Recommended size 200x200.</p>
                            <input
                              type="file"
                              accept=".png,.jpg,.jpeg"
                              onChange={e => {
                                const file = e.target.files ? e.target.files[0] : null;
                                if (file && file.size > 5 * 1024 * 1024) {
                                  addToast("Logo must be 5MB or less", "error");
                                  return setLogoFile(null);
                                }
                                setLogoFile(file);
                              }}
                              className="text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                            />
                          </div>

                          <div className="p-6 border-2 border-dashed border-indigo-100 rounded-xl bg-indigo-50/30 flex flex-col items-center">
                            <FileUp size={32} className="text-indigo-400 mb-2" />
                            <p className="text-sm font-medium text-indigo-900">Upload Full Proposal Document</p>
                            <p className="text-xs text-slate-500 mb-4">{isEditingProposal ? "Leave empty to keep existing document. PDF or Docx preferred." : "Max 2-3 pages. PDF or Docx preferred."}</p>
                            <input
                              type="file"
                              accept=".pdf,.doc,.docx"
                              required={!isEditingProposal}
                              onChange={e => setProposalFile(e.target.files ? e.target.files[0] : null)}
                              className="text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                            />
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-4">
                        <button
                          type="submit"
                          disabled={isSubmitting}
                          className="flex-1 bg-indigo-600 text-white py-3 rounded-lg font-bold hover:bg-indigo-700 disabled:bg-indigo-300 flex justify-center items-center gap-2"
                        >
                          {isSubmitting && <Loader2 className="animate-spin" size={18} />}
                          {isEditingProposal ? "Update Proposal" : "Submit Proposal"}
                        </button>
                        {isEditingProposal && (
                          <button
                            type="button"
                            onClick={() => setIsEditingProposal(false)}
                            className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-lg font-bold hover:bg-gray-200 transition-colors"
                          >
                            Cancel
                          </button>
                        )}
                      </div>
                    </form>
                  ) : (
                    <div className="p-6 text-center text-gray-500 italic">Only the founder can submit proposals.</div>
                  )}
                </div>

                <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                  <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">Stage II: Pitch Deck</h3>
                      <p className="text-xs text-slate-500">5-7 Slides (PDF/PPTX) | Deadline: {pitchDeckDeadline.toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}</p>
                    </div>
                    {hasSubmittedPitchDeck ? (
                      <span className="flex items-center gap-1 text-green-600 font-bold bg-green-50 px-3 py-1 rounded-full text-sm">
                        <CheckCircle2 size={16} /> Submitted
                      </span>
                    ) : (
                      <span className="text-amber-600 font-bold bg-amber-50 px-3 py-1 rounded-full text-sm">Pending</span>
                    )}
                  </div>

                  {hasSubmittedPitchDeck && !isEditingPitchDeck ? (
                    <div className="p-8 bg-gray-50 text-center space-y-4">
                      <a href={submissions.find(s => s.stage === "PITCH_DECK")?.content.pitchDeckUrl} target="_blank" rel="noreferrer" className="text-indigo-600 font-bold hover:underline flex items-center justify-center gap-2">
                        <ExternalLink size={18} /> View Pitch Deck
                      </a>
                      {isFounder && canEditPitchDeck && (
                        <div className="pt-2">
                          <button
                            onClick={() => setIsEditingPitchDeck(true)}
                            className="px-6 py-2 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 transition-colors"
                          >
                            Edit Submission
                          </button>
                        </div>
                      )}
                    </div>
                  ) : isFounder ? (
                    <form onSubmit={handleSubmitPitchDeck} className="p-6 space-y-4">
                      <div className="p-6 border-2 border-dashed border-indigo-100 rounded-xl bg-indigo-50/30 flex flex-col items-center">
                        <FileUp size={32} className="text-indigo-400 mb-2" />
                        <p className="text-sm font-medium text-indigo-900">Upload Final Pitch Deck</p>
                        <p className="text-xs text-slate-500 mb-4">{isEditingPitchDeck ? "Leave empty to keep existing pitch deck. 5-7 slides. PDF or PPTX preferred." : "5-7 slides. PDF or PPTX preferred."}</p>
                        <input
                          type="file"
                          accept=".pdf,.ppt,.pptx"
                          required={!isEditingPitchDeck}
                          onChange={e => setPitchDeckFile(e.target.files ? e.target.files[0] : null)}
                          className="text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                        />
                      </div>
                      <div className="flex gap-4">
                        <button
                          type="submit"
                          disabled={!hasSubmittedProposal || isSubmitting}
                          className="flex-1 bg-indigo-600 text-white py-3 rounded-lg font-bold disabled:bg-gray-300 flex justify-center items-center gap-2"
                        >
                          {isSubmitting && <Loader2 className="animate-spin" size={18} />}
                          {isEditingPitchDeck ? "Update Pitch Deck" : "Submit Pitch Deck"}
                        </button>
                        {isEditingPitchDeck && (
                          <button
                            type="button"
                            onClick={() => setIsEditingPitchDeck(false)}
                            className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-lg font-bold hover:bg-gray-200 transition-colors"
                          >
                            Cancel
                          </button>
                        )}
                      </div>
                    </form>
                  ) : (
                    <div className="p-6 text-center text-gray-500 italic">Only the founder can submit pitch decks.</div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === "SHORTLISTED" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">Shortlisted Projects</h2>
              <span className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-xs font-bold">
                {shortlistedSubmissions.length} Projects
              </span>
            </div>

            {shortlistedSubmissions.length > 0 ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {shortlistedSubmissions.map((submission) => (
                  <div key={submission._id} className="bg-white border border-gray-200 rounded-2xl overflow-hidden hover:shadow-lg transition-shadow">
                    <div className="p-6 bg-indigo-50/50 border-b border-gray-100">
                      <div className="flex items-center gap-3 mb-3">
                        {submission.content.logoUrl ? (
                          <img src={submission.content.logoUrl} alt={submission.content.projectTitle} className="w-10 h-10 rounded-full object-cover border border-indigo-100 shadow-sm" />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center border border-indigo-100 shadow-sm">
                            <Rocket className="text-indigo-600" size={20} />
                          </div>
                        )}
                        <h3 className="font-bold text-gray-900 line-clamp-1">{submission.content.projectTitle}</h3>
                      </div>
                      <p className="text-sm text-gray-600 line-clamp-3 min-h-[60px]">
                        {submission.content.problemStatement}
                      </p>
                    </div>
                    <div className="p-6 space-y-4">
                      <div>
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Team Name</label>
                        <p className="text-sm font-semibold text-gray-800">{submission.team.name}</p>
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Founder</label>
                          <p className="text-xs text-gray-700">{submission.team.founder.firstName} {submission.team.founder.lastName}</p>
                        </div>
                        <div className="flex -space-x-2">
                          {submission.team.members.slice(0, 3).map((m: any, idx: number) => (
                            <div key={idx} className="w-6 h-6 rounded-full bg-indigo-200 border-2 border-white flex items-center justify-center text-[8px] font-bold text-indigo-700">
                              {m.firstName[0]}
                            </div>
                          ))}
                          {submission.team.members.length > 3 && (
                            <div className="w-6 h-6 rounded-full bg-gray-100 border-2 border-white flex items-center justify-center text-[8px] font-bold text-gray-500">
                              +{submission.team.members.length - 3}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-20 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                <p className="text-gray-500 font-medium">No projects have been shortlisted yet.</p>
                <p className="text-sm text-gray-400 mt-1">Check back later for updates from the admin team.</p>
              </div>
            )}
          </div>
        )}
      </div>
      {/* Team Details Modal */}
      {/* Invite Member Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-bold">Invite Member</h3>
              <button onClick={() => { setShowInviteModal(false); setSearchResults([]); setSearchQuery(""); setInviteMessage(null); }} className="text-gray-400 hover:text-gray-600">Close</button>
            </div>

            <div>
              <input
                value={searchQuery}
                onChange={e => searchAmbassadors(e.target.value)}
                placeholder="Search by name or email (min 2 chars)"
                className="w-full p-2 border rounded-lg"
              />
            </div>

            <div className="max-h-64 overflow-auto">
              {isSearching ? (
                <p className="text-sm text-gray-500">Searching...</p>
              ) : searchResults.length > 0 ? (
                searchResults.map((r: any) => (
                  <div key={r._id} className="flex items-center justify-between py-2 border-b">
                    <div>
                      <p className="font-medium">{r.firstName} {r.lastName}</p>
                      <p className="text-sm text-gray-500">{r.email}</p>
                    </div>
                    <div>
                      <button onClick={() => handleInvite({ userId: r._id })} disabled={isInviting} className="px-3 py-1 bg-indigo-600 text-white rounded-md text-sm">Invite</button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-sm text-gray-500">No results</div>
              )}

              {inviteMessage && <div className="mt-3 text-sm text-green-600">{inviteMessage}</div>}
            </div>

            <div className="pt-2">
              <p className="text-sm text-gray-500 mb-2">Or invite by email</p>
              <InviteByEmailForm onInvite={(email: string) => handleInvite({ email })} loading={isInviting} />
            </div>
          </div>
        </div>
      )}

      {/* Leave Team Confirmation Modal */}
      {showLeaveModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-md p-8 md:p-10 text-center space-y-8"
          >
            <div className="w-20 h-20 bg-red-50 rounded-3xl flex items-center justify-center mx-auto shadow-inner">
               <Rocket size={40} className="text-red-500 rotate-180" />
            </div>
            
            <div className="space-y-3">
              <h3 className="text-2xl font-black font-heading text-slate-900 tracking-tight">Confirm Departure?</h3>
              <p className="text-slate-500 font-medium text-sm leading-relaxed">
                You are about to exit <span className="text-slate-900 font-bold">{myTeam?.name}</span>. This action is final and you will need a new invitation to re-join.
              </p>
            </div>

            <div className="flex flex-col gap-3">
              <button 
                onClick={confirmLeaveTeamAction} 
                className="w-full py-4 bg-red-600 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-lg shadow-red-600/20 hover:bg-red-700 hover:scale-[1.02] active:scale-95 transition-all cursor-pointer"
              >
                Confirm Departure
              </button>
              <button 
                onClick={() => setShowLeaveModal(false)} 
                className="w-full py-4 bg-slate-50 text-slate-400 hover:text-slate-600 rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all cursor-pointer"
              >
                Stay with Team
              </button>
            </div>
          </motion.div>
        </div>
      )}
      {selectedTeam && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-8 space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">{selectedTeam.name}</h2>
              <button onClick={() => setSelectedTeam(null)} className="text-gray-400 hover:text-gray-600">Close</button>
            </div>
            <div className="space-y-4">
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Idea Description</p>
                <p className="text-gray-700 mt-1">{selectedTeam.ideaDescription || "No description provided."}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Track</p>
                  <p className="text-gray-800 font-medium mt-1">{selectedTeam.track || "Not specified"}</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Members</p>
                  <p className="text-gray-800 font-medium mt-1">{selectedTeam.members.length} / 5</p>
                </div>
              </div>
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Team Members</p>
                <div className="space-y-2 mt-2">
                  {selectedTeam.members.map((m) => (
                    <div key={m._id} className="flex items-center gap-2 text-sm text-gray-700">
                      <div className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center text-[10px] font-bold text-indigo-700">
                        {m.firstName[0]}{m.lastName[0]}
                      </div>
                      {m.firstName} {m.lastName}
                    </div>
                  ))}
                </div>
              </div>
            </div>
            {!myTeam && (
              <button
                onClick={() => {
                  handleJoinTeam(selectedTeam._id);
                  setSelectedTeam(null);
                }}
                className="w-full bg-indigo-600 text-white py-3 rounded-lg font-bold hover:bg-indigo-700 transition-colors"
              >
                Join This Team
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CapstonePage;
