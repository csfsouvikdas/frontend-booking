import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState, useEffect, useRef } from "react";
import { store, useStore, getSlots, type Service, type Booking } from "@/features/booking/store";
import { openRazorpay } from "@/features/booking/razorpay";
import { downloadIcs } from "@/features/booking/ics";
import heroIllustration from "../hero-illustration.png";
import logoImg from "../logo.png";
import {
  Search,
  Calendar,
  Clock,
  User,
  Users,
  CheckCircle,
  AlertCircle,
  XCircle,
  Video,
  ArrowRight,
  Hash,
  Mail,
  Copy,
  Check,
} from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Live Booking & Consultation Portal" },
      {
        name: "description",
        content:
          "Schedule expert calls, consultations, and discovery sessions with our team instantly.",
      },
    ],
  }),
  component: PublicPage,
});

type Step = "browse" | "datetime" | "details" | "payment" | "confirm";

const getServiceIcon = (name: string) => {
  const n = name.toLowerCase();
  if (n.includes("discovery") || n.includes("call") || n.includes("intro")) {
    return (
      <svg
        className="h-5 w-5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
        />
      </svg>
    );
  }
  if (n.includes("premium") || n.includes("strategy") || n.includes("expert")) {
    return (
      <svg
        className="h-5 w-5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    );
  }
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
      />
    </svg>
  );
};

function MeetingLobby({
  booking,
  service,
  onJoin,
  onExit,
}: {
  booking: Booking;
  service: Service | undefined;
  onJoin: () => void;
  onExit: () => void;
}) {
  const [timeLeft, setTimeLeft] = useState("");

  useEffect(() => {
    const calculateTime = () => {
      const mtgTime = new Date(`${booking.date}T${booking.time}:00`);
      const now = new Date();
      const diff = mtgTime.getTime() - now.getTime();

      if (diff <= 0) {
        setTimeLeft("Meeting is live now!");
        return;
      }

      const hrs = Math.floor(diff / (1000 * 60 * 60));
      const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const secs = Math.floor((diff % (1000 * 60)) / 1000);

      const parts = [];
      if (hrs > 0) parts.push(`${hrs}h`);
      if (mins > 0 || hrs > 0) parts.push(`${mins}m`);
      parts.push(`${secs}s`);

      setTimeLeft(`Starts in ${parts.join(" ")}`);
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000);
    return () => clearInterval(interval);
  }, [booking.date, booking.time]);

  return (
    <div className="bg-slate-900 rounded-3xl border border-slate-800 p-6 md:p-8 shadow-2xl text-center max-w-xl mx-auto animate-fade-in-up relative overflow-hidden">
      <div className="absolute -top-24 -left-24 w-48 h-48 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />
      <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-violet-500/10 rounded-full blur-2xl pointer-events-none" />

      <div className="relative z-10 space-y-6">
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-500/10 px-3 py-1 text-xs font-semibold text-indigo-400 mb-4 border border-indigo-500/20">
            📽️ Virtual Meeting Lobby
          </span>
          <h1 className="text-2xl font-black text-white tracking-tight uppercase">
            {service?.name || "Video Call Room"}
          </h1>
          <p className="text-sm text-slate-400 mt-2 font-medium">
            Session hosted by <span className="text-indigo-400">Twinstdio Specialist</span>
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-950/60 border border-slate-800 text-left space-y-3.5">
          <div className="flex justify-between items-center text-sm border-b border-slate-900 pb-2">
            <span className="text-slate-500 font-semibold">Attendee</span>
            <span className="text-slate-200 font-bold">{booking.clientName}</span>
          </div>
          <div className="flex justify-between items-center text-sm border-b border-slate-900 pb-2">
            <span className="text-slate-500 font-semibold">Duration</span>
            <span className="text-slate-200 font-bold">{service?.duration || 30} mins</span>
          </div>
          <div className="flex justify-between items-center text-sm border-b border-slate-900 pb-2">
            <span className="text-slate-500 font-semibold">Schedule</span>
            <span className="text-slate-200 font-bold">
              {booking.date} @ {booking.time}
            </span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-slate-500 font-semibold">Countdown</span>
            <span className="text-indigo-400 font-black animate-pulse">{timeLeft}</span>
          </div>
        </div>

        <div className="space-y-3 pt-2">
          <button
            onClick={onJoin}
            className="w-full inline-flex items-center justify-center gap-2.5 rounded-xl bg-indigo-600 px-5 py-3.5 text-sm font-bold text-white shadow-lg shadow-indigo-500/25 hover:bg-indigo-700 active:scale-95 transition cursor-pointer hover:shadow-indigo-500/40"
          >
            <Video className="h-4.5 w-4.5 animate-pulse" />
            <span>Enter Video Meeting Room</span>
          </button>
          <button
            onClick={onExit}
            className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-slate-800 border border-slate-700/80 px-5 py-3 text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-750 transition cursor-pointer active:scale-98"
          >
            Go Back
          </button>
        </div>
      </div>
    </div>
  );
}

function PublicPage() {
  const { services } = useStore();
  const [view, setView] = useState<"book" | "manage" | "meeting">("book");
  const [activeMeetingBooking, setActiveMeetingBooking] = useState<Booking | null>(null);
  const [hasJoinedMeeting, setHasJoinedMeeting] = useState(false);
  const [step, setStep] = useState<Step>("browse");
  const [selected, setSelected] = useState<Service | null>(null);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [form, setForm] = useState({ name: "", email: "", phone: "", attendees: 1, notes: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [payError, setPayError] = useState("");
  const [confirmed, setConfirmed] = useState<Booking | null>(null);
  const [reschedulingId, setReschedulingId] = useState<string | null>(null);
  const [legalModal, setLegalModal] = useState<"privacy" | "terms" | null>(null);

  // Filters
  const [typeFilter, setTypeFilter] = useState<"all" | "free" | "paid">("all");
  const [catFilter, setCatFilter] = useState<string>("all");

  const [lookup, setLookup] = useState({ ref: "", email: "" });
  const [lookupErr, setLookupErr] = useState("");
  const [foundBooking, setFoundBooking] = useState<Booking | null>(null);

  const activeServices = services.filter((s) => s.active);
  const categories = Array.from(new Set(activeServices.map((s) => s.category)));
  const filtered = activeServices.filter(
    (s) =>
      (typeFilter === "all" || s.type === typeFilter) &&
      (catFilter === "all" || s.category === catFilter),
  );

  const reset = () => {
    setStep("browse");
    setSelected(null);
    setDate("");
    setTime("");
    setForm({ name: "", email: "", phone: "", attendees: 1, notes: "" });
    setErrors({});
    setPayError("");
    setReschedulingId(null);
    setHasJoinedMeeting(false);
  };

  const startBooking = (s: Service) => {
    setSelected(s);
    setForm((f) => ({ ...f, attendees: 1 }));
    setStep("datetime");
  };

  const submitDetails = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = "Required";
    if (!/^\S+@\S+\.\S+$/.test(form.email)) e.email = "Valid email required";
    if (!form.phone.trim()) e.phone = "Required";
    if (form.attendees < 1 || form.attendees > (selected?.maxAttendees ?? 1))
      e.attendees = `1 to ${selected?.maxAttendees}`;
    setErrors(e);
    if (Object.keys(e).length) return;
    if (selected?.type === "paid" && !reschedulingId) setStep("payment");
    else finalize();
  };

  const finalize = (paid = false) => {
    if (!selected) return;
    const s = store.get();
    if (reschedulingId) {
      const updated = s.bookings.map((b) =>
        b.id === reschedulingId
          ? { ...b, date, time, attendees: form.attendees, status: "confirmed" as const }
          : b,
      );
      store.setBookings(updated);
      const b = updated.find((x) => x.id === reschedulingId)!;
      setConfirmed(b);
    } else {
      const b: Booking = {
        id: store.newId(),
        serviceId: selected.id,
        date,
        time,
        attendees: form.attendees,
        clientName: form.name,
        email: form.email,
        phone: form.phone,
        notes: form.notes,
        status: "pending",
        payment: selected.type === "free" ? "free" : "paid",
        createdAt: new Date().toISOString(),
      };
      store.setBookings([...s.bookings, b]);
      setConfirmed(b);
    }
    setStep("confirm");
  };

  const pay = async () => {
    if (!selected) return;
    setPayError("");

    const bId = store.newId();
    const newBooking: Booking = {
      id: bId,
      serviceId: selected.id,
      date,
      time,
      attendees: form.attendees,
      clientName: form.name,
      email: form.email,
      phone: form.phone,
      notes: form.notes,
      status: "pending",
      payment: "paid",
      createdAt: new Date().toISOString(),
    };

    openRazorpay({
      amountInr: selected.price * form.attendees,
      name: selected.name,
      description: `${form.attendees} × ${selected.name}`,
      prefill: { name: form.name, email: form.email, contact: form.phone },
      onSuccess: async (details) => {
        try {
          const verifyRes = await fetch("https://appointment-api.twinstdio.com/api/payments/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              razorpay_payment_id: details.razorpay_payment_id,
              razorpay_order_id: details.razorpay_order_id,
              razorpay_signature: details.razorpay_signature,
              booking: newBooking,
            }),
          });
          const verifyData = await verifyRes.json();
          if (verifyRes.ok && verifyData.success) {
            const syncedBooking = verifyData.booking || {
              ...newBooking,
              status: "pending" as const,
            };
            store.setBookings([...store.get().bookings, syncedBooking]);
            setConfirmed(syncedBooking);
            setStep("confirm");
          } else {
            setPayError(verifyData.error || "Payment verification failed.");
          }
        } catch (err) {
          console.error("Payment verification request failed:", err);
          setPayError("Verification request failed. Please check backend connection.");
        }
      },
      onFailure: (msg) => {
        setPayError(msg);
      },
    });
  };

  const doLookup = () => {
    const b = store
      .get()
      .bookings.find(
        (x) =>
          x.id.toUpperCase() === lookup.ref.trim().toUpperCase() &&
          x.email.toLowerCase() === lookup.email.trim().toLowerCase(),
      );
    if (!b) {
      setLookupErr("No booking found with those details.");
      setFoundBooking(null);
      return;
    }
    setLookupErr("");
    setFoundBooking(b);
  };

  const startReschedule = (b: Booking) => {
    const svc = store.get().services.find((s) => s.id === b.serviceId);
    if (!svc) return;
    setSelected(svc);
    setForm({
      name: b.clientName,
      email: b.email,
      phone: b.phone,
      attendees: b.attendees,
      notes: b.notes || "",
    });
    setReschedulingId(b.id);
    setView("book");
    setStep("datetime");
  };

  const cancelBooking = (b: Booking) => {
    const updated = store
      .get()
      .bookings.map((x) => (x.id === b.id ? { ...x, status: "cancelled" as const } : x));
    store.setBookings(updated);
    setFoundBooking({ ...b, status: "cancelled" });
  };

  // Load query param for direct service booking in a new tab
  useEffect(() => {
    if (typeof window === "undefined" || !services.length) return;
    const params = new URLSearchParams(window.location.search);
    const serviceId = params.get("service");
    if (serviceId) {
      const match = services.find((s) => s.id === serviceId);
      if (match) {
        setSelected(match);
        setForm((f) => ({ ...f, attendees: 1 }));
        setStep("datetime");
      }
    }
  }, [services]);

  // Automatically lookup and manage a booking when ref and email are passed in the URL (e.g. from QR code scan)
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const ref = params.get("ref");
    const email = params.get("email");
    if (ref && email) {
      setView("manage");
      setLookup({ ref, email });
      const b = store
        .get()
        .bookings.find(
          (x) =>
            x.id.toUpperCase() === ref.trim().toUpperCase() &&
            x.email.toLowerCase() === email.trim().toLowerCase(),
        );
      if (b) {
        setFoundBooking(b);
      }
    }
  }, [services]);

  // Load query param for direct meeting joining (e.g. from confirmed QR code scan)
  useEffect(() => {
    if (typeof window === "undefined" || !services.length) return;
    const params = new URLSearchParams(window.location.search);
    const meetingId = params.get("meeting");
    if (meetingId) {
      const b = store.get().bookings.find((x) => x.id.toUpperCase() === meetingId.toUpperCase());
      if (b && b.status === "confirmed") {
        setActiveMeetingBooking(b);
        setView("meeting");
      }
    }
  }, [services]);
  return (
    <div className="relative min-h-screen bg-slate-50 flex flex-col font-sans overflow-hidden">
      {/* Dynamic Interactive Dot Grid (follows cursor position) */}
      <InteractiveDotGrid />
      {/* Animated Liquid Wave Background */}
      <div className="absolute top-0 left-0 right-0 h-[480px] overflow-hidden pointer-events-none z-0 opacity-85">
        <svg
          className="absolute w-[200%] h-full top-[-80px] left-0 fill-indigo-200/60 animate-wave"
          viewBox="0 0 2880 320"
          preserveAspectRatio="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M0,160 C320,300,480,40,720,160 C960,280,1120,60,1440,160 C1760,300,1920,40,2160,160 C2400,280,2560,60,2880,160 L2880,0 L0,0 Z" />
        </svg>
        <svg
          className="absolute w-[200%] h-full top-[-50px] left-0 fill-violet-200/45 animate-wave-slow"
          viewBox="0 0 2880 320"
          preserveAspectRatio="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M0,120 C360,240,540,60,720,120 C900,180,1080,40,1440,120 C1800,240,1980,60,2160,120 C2340,180,2520,40,2880,120 L2880,0 L0,0 Z" />
        </svg>
      </div>

      <Header
        view={view}
        onView={(v) => {
          setView(v);
          reset();
          setFoundBooking(null);
          if (v === "book") {
            setTimeout(() => {
              const el = document.getElementById("choose-service");
              if (el) {
                el.scrollIntoView({ behavior: "smooth", block: "start" });
              }
            }, 100);
          }
        }}
      />

      <main className="relative z-10 mx-auto w-full max-w-6xl px-4 py-8 sm:py-12 flex-grow">
        {view === "meeting" && activeMeetingBooking ? (
          hasJoinedMeeting ? (
            <div className="bg-slate-900 rounded-3xl border border-slate-800 p-4 sm:p-6 md:p-8 shadow-2xl text-center max-w-4xl mx-auto animate-fade-in-up">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-slate-850 pb-6 mb-6">
                <div className="text-left w-full sm:w-auto">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-400 mb-2 animate-pulse">
                    ● Meeting Call Live
                  </span>
                  <h1 className="text-xl font-bold text-white uppercase">
                    {activeMeetingBooking.clientName}'s Session
                  </h1>
                  <p className="text-sm text-slate-400 mt-0.5">
                    Reference ID: {activeMeetingBooking.id}
                  </p>
                </div>
                <button
                  onClick={() => {
                    setView("book");
                    reset();
                  }}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-slate-800 border border-slate-700 px-4 py-2.5 text-sm font-semibold text-slate-300 hover:bg-slate-700 hover:text-white transition active:scale-95 cursor-pointer"
                >
                  Exit Meeting Room
                </button>
              </div>

              <div className="relative aspect-[3/4] sm:aspect-video w-full rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 shadow-inner">
                <iframe
                  src={`https://meet.jit.si/Twinstdio_${activeMeetingBooking.id}#config.prejoinPageEnabled=false&userInfo.displayName=${encodeURIComponent(activeMeetingBooking.clientName)}`}
                  className="absolute inset-0 w-full h-full border-none"
                  allow="camera; microphone; fullscreen; display-capture; autoplay"
                />
              </div>

              <p className="text-xs text-slate-500 mt-4 font-medium">
                * Note: Please make sure to allow Camera & Microphone access inside your browser
                settings to participate in the meeting.
              </p>
            </div>
          ) : (
            <MeetingLobby
              booking={activeMeetingBooking}
              service={services.find((s) => s.id === activeMeetingBooking.serviceId)}
              onJoin={() => setHasJoinedMeeting(true)}
              onExit={() => {
                setView("book");
                reset();
              }}
            />
          )
        ) : view === "book" ? (
          <>
            {/* Dynamic Hero Section */}
            {step === "browse" && (
              <div className="mb-16 text-center max-w-3xl mx-auto flex flex-col items-center justify-center animate-fade-in-up">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 px-3.5 py-1 text-xs font-semibold text-indigo-700 mb-5 border border-indigo-100/60 shadow-sm">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
                  </span>
                  Live Booking System
                </span>
                <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-slate-900 leading-tight">
                  Schedule Your Session <br />
                  <span className="bg-gradient-to-r from-indigo-600 via-violet-600 to-indigo-500 bg-clip-text text-transparent">
                    With Absolute Ease
                  </span>
                </h1>
                <p className="mt-4 text-base md:text-lg text-slate-600 leading-relaxed max-w-2xl mx-auto">
                  Book standard consultations, premium strategizing sessions, or get started with a
                  free introductory call. Fast integration, secure processing, and instant sync.
                </p>
                <div className="mt-8 flex flex-wrap justify-center gap-3 text-xs md:text-sm font-medium text-slate-700">
                  <div className="flex items-center gap-2 bg-white px-4 py-3 rounded-xl border border-slate-200/60 shadow-sm transition hover:shadow-md">
                    <span className="text-emerald-500 font-bold">✓</span> Real-Time Calendars
                  </div>
                  <div className="flex items-center gap-2 bg-white px-4 py-3 rounded-xl border border-slate-200/60 shadow-sm transition hover:shadow-md">
                    <span className="text-emerald-500 font-bold">✓</span> Secure Razorpay Payments
                  </div>
                  <div className="flex items-center gap-2 bg-white px-4 py-3 rounded-xl border border-slate-200/60 shadow-sm transition hover:shadow-md">
                    <span className="text-emerald-500 font-bold">✓</span> Automatic Email Alerts
                  </div>
                </div>
              </div>
            )}

            <div
              id="choose-service"
              className="backdrop-blur-md bg-white/75 rounded-2xl border border-slate-200/40 p-6 md:p-10 shadow-xl shadow-slate-100/40 animate-fade-in-up scroll-mt-24"
            >
              <Stepper step={step} hasPayment={selected?.type === "paid"} />

              {step === "browse" && (
                <Browse
                  services={filtered}
                  categories={categories}
                  typeFilter={typeFilter}
                  setTypeFilter={setTypeFilter}
                  catFilter={catFilter}
                  setCatFilter={setCatFilter}
                  onPick={startBooking}
                />
              )}
              {step === "datetime" && selected && (
                <DateTimeStep
                  service={selected}
                  date={date}
                  setDate={setDate}
                  time={time}
                  setTime={setTime}
                  onBack={() => setStep("browse")}
                  onNext={() => setStep("details")}
                />
              )}
              {step === "details" && selected && (
                <DetailsStep
                  service={selected}
                  form={form}
                  setForm={setForm}
                  errors={errors}
                  onBack={() => setStep("datetime")}
                  onNext={submitDetails}
                />
              )}
              {step === "payment" && selected && (
                <PaymentStep
                  service={selected}
                  attendees={form.attendees}
                  date={date}
                  time={time}
                  onBack={() => setStep("details")}
                  onPay={pay}
                  error={payError}
                />
              )}
              {step === "confirm" && confirmed && selected && (
                <ConfirmStep
                  booking={confirmed}
                  service={selected}
                  onNew={reset}
                  onManage={() => {
                    setView("manage");
                    setLookup({ ref: confirmed.id, email: confirmed.email });
                  }}
                  onJoinMeeting={() => {
                    setActiveMeetingBooking(confirmed);
                    setView("meeting");
                  }}
                />
              )}
            </div>
          </>
        ) : (
          <div className="max-w-3xl mx-auto animate-fade-in-up">
            <ManageBooking
              lookup={lookup}
              setLookup={setLookup}
              onLookup={doLookup}
              err={lookupErr}
              booking={foundBooking}
              onReschedule={startReschedule}
              onCancel={cancelBooking}
              onJoinMeeting={(b: Booking) => {
                setActiveMeetingBooking(b);
                setView("meeting");
              }}
            />
          </div>
        )}
      </main>

      <Footer
        onView={(v) => {
          setView(v);
          reset();
          setFoundBooking(null);
        }}
        onLegal={(type) => setLegalModal(type)}
      />

      {legalModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[80vh] overflow-y-auto p-6 md:p-8 shadow-2xl border border-slate-100 flex flex-col animate-fade-in-up">
            <div className="flex justify-between items-center pb-4 border-b border-slate-150 mb-6">
              <h2 className="text-xl font-bold text-slate-900">
                {legalModal === "privacy" ? "Privacy Policy" : "Terms of Service"}
              </h2>
              <button
                onClick={() => setLegalModal(null)}
                className="text-slate-400 hover:text-slate-600 rounded-lg p-1.5 hover:bg-slate-50 transition"
              >
                <svg
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2.5}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="text-slate-600 text-sm leading-relaxed space-y-4 flex-grow overflow-y-auto pr-2 text-left">
              {legalModal === "privacy" ? (
                <>
                  <p className="font-semibold text-slate-800">Effective Date: June 28, 2026</p>
                  <p>
                    At twinstdio, accessible from our live consultation portal, one of our main
                    priorities is the privacy of our visitors. This Privacy Policy document contains
                    types of information that is collected and recorded by twinstdio and how we use
                    it.
                  </p>
                  <h3 className="font-bold text-slate-800 text-base mt-4">
                    1. Information We Collect
                  </h3>
                  <p>
                    We collect personal information that you voluntarily provide to us when booking
                    a consultation slot. This includes your full name, email address, phone number,
                    and any special requests or notes.
                  </p>
                  <h3 className="font-bold text-slate-800 text-base mt-4">
                    2. Secure Payment Processing
                  </h3>
                  <p>
                    For paid sessions, payment is processed securely via Razorpay. We do not store
                    or host credit card details or financial identifiers on our database or servers.
                  </p>
                  <h3 className="font-bold text-slate-800 text-base mt-4">
                    3. How We Use Your Information
                  </h3>
                  <p>
                    We use the information we collect to schedule and verify consultation
                    appointments, trigger email updates and notifications regarding slot updates
                    (confirmations/cancellations), and provide customer assistance.
                  </p>
                  <h3 className="font-bold text-slate-800 text-base mt-4">4. Virtual Meetings</h3>
                  <p>
                    Virtual meeting call sessions are hosted online and require temporary mic and
                    camera permissions to enable WebRTC video conferencing.
                  </p>
                </>
              ) : (
                <>
                  <p className="font-semibold text-slate-800">Last Updated: June 28, 2026</p>
                  <p>
                    Welcome to twinstdio! These terms and conditions outline the rules and
                    regulations for the use of twinstdio's Live Booking & Consultation Portal.
                  </p>
                  <h3 className="font-bold text-slate-800 text-base mt-4">
                    1. Appointment Booking & Verification
                  </h3>
                  <p>
                    By submitting a booking request, you agree to provide accurate personal
                    credentials. Slot allocation is subject to availability and administrator
                    verification.
                  </p>
                  <h3 className="font-bold text-slate-800 text-base mt-4">
                    2. Payment and Refund Policy
                  </h3>
                  <p>
                    For premium/paid strategy calls, slot allocation is pending successful payment
                    authorization. All transaction records are generated instantly upon order
                    confirmation.
                  </p>
                  <h3 className="font-bold text-slate-800 text-base mt-4">
                    3. Meeting Call Access
                  </h3>
                  <p>
                    Virtual consultation links generated upon confirmation are strictly for personal
                    or business-authorized usage. Participants must cooperate with microphone and
                    camera standards to ensure premium communication quality.
                  </p>
                  <h3 className="font-bold text-slate-800 text-base mt-4">4. Scheduling Changes</h3>
                  <p>
                    Twinstdio reserves the right to cancel, postpone, or adjust consultation slots
                    due to conflict of interest or scheduling limits.
                  </p>
                </>
              )}
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setLegalModal(null)}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm px-6 py-2.5 rounded-xl shadow-md shadow-indigo-100 transition active:scale-95"
              >
                Close Page
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function InteractiveDotGrid() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const mouse = { x: -1000, y: -1000, radius: 145 };

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top + window.scrollY;
    };

    const handleMouseLeave = () => {
      mouse.x = -1000;
      mouse.y = -1000;
    };

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = document.documentElement.scrollHeight || window.innerHeight;
    };

    window.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseleave", handleMouseLeave);
    window.addEventListener("resize", handleResize);

    // Initial height sync to support full scrolling container
    setTimeout(() => {
      handleResize();
    }, 100);

    const dotsGap = 24;
    const baseRadius = 1.25;
    let time = 0;

    const draw = () => {
      ctx.clearRect(0, 0, width, height);

      time += 0.005;

      const cols = Math.ceil(width / dotsGap);
      const rows = Math.ceil(height / dotsGap);

      for (let i = 0; i <= cols; i++) {
        for (let j = 0; j <= rows; j++) {
          const x = i * dotsGap;
          const y = j * dotsGap;

          // Compute distance to mouse cursor
          const dxMouse = mouse.x - x;
          const dyMouse = mouse.y - y;
          const distMouse = Math.sqrt(dxMouse * dxMouse + dyMouse * dyMouse);

          const r = baseRadius;
          // Keep grey dots at constant default opacity always in the background
          const baseOpacity = 0.35;
          let color = `rgba(203, 213, 225, ${baseOpacity})`;

          // Proximity factor for mouse cursor
          let factorMouse = 0;
          if (distMouse < mouse.radius) {
            factorMouse = 1 - distMouse / mouse.radius;
          }

          // Only highlight using mouse factor
          const combinedFactor = factorMouse;

          let offsetX = 0;
          let offsetY = 0;

          if (combinedFactor > 0) {
            // Adjust opacity and color when hovered/highlighted to make it dark
            const targetOpacity = 0.4 + 0.6 * combinedFactor;
            color = `rgba(0, 0, 0, ${targetOpacity})`;

            // Shimmery wiggle movement for highlighted dots
            offsetX = Math.sin(time * 10 + (i + j) * 0.8) * 3.5 * combinedFactor;
            offsetY = Math.cos(time * 10 + (i - j) * 0.8) * 3.5 * combinedFactor;
          }

          ctx.beginPath();
          ctx.arc(x + offsetX, y + offsetY, r, 0, Math.PI * 2);
          ctx.fillStyle = color;
          ctx.fill();
        }
      }

      animationFrameId = requestAnimationFrame(draw);
    };

    ctx.clearRect(0, 0, width, height);
    draw();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseleave", handleMouseLeave);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none z-0" />
  );
}

function Header({
  view,
  onView,
}: {
  view: "book" | "manage" | "meeting";
  onView: (v: "book" | "manage") => void;
}) {
  return (
    <header className="sticky top-0 z-50 backdrop-blur-md bg-white/85 border-b border-slate-200/50 shadow-sm">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
        <button
          onClick={() => onView("book")}
          className="flex items-center transition hover:scale-[1.02] active:scale-[0.98]"
        >
          <img src={logoImg} alt="Logo" className="h-8 w-auto object-contain" />
        </button>
        <nav className="flex items-center gap-1.5">
          <button onClick={() => onView("book")} className={navCls(view === "book")}>
            <span className="sm:hidden">Book</span>
            <span className="hidden sm:inline">Book Appointment</span>
          </button>
          <button onClick={() => onView("manage")} className={navCls(view === "manage")}>
            <span className="sm:hidden">My Bookings</span>
            <span className="hidden sm:inline">My Booking</span>
          </button>
        </nav>
      </div>
    </header>
  );
}
const navCls = (active: boolean) =>
  `rounded-xl px-3 sm:px-4 py-2 text-xs sm:text-sm font-semibold transition-all duration-300 ${active ? "bg-indigo-600 text-white shadow-md shadow-indigo-100" : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"}`;

function Stepper({ step, hasPayment }: { step: Step; hasPayment: boolean }) {
  const steps: { id: Step; label: string }[] = [
    { id: "browse", label: "Service" },
    { id: "datetime", label: "Date & Time" },
    { id: "details", label: "Details" },
    ...(hasPayment ? [{ id: "payment" as Step, label: "Payment" }] : []),
    { id: "confirm", label: "Confirm" },
  ];
  const idx = steps.findIndex((s) => s.id === step);
  return (
    <ol className="mb-10 flex items-center justify-center gap-2 sm:gap-4 border-b border-slate-100 pb-6 text-sm">
      {steps.map((s, i) => (
        <li key={s.id} className="flex items-center gap-1.5 sm:gap-2">
          <span
            className={`flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-full text-xs font-bold transition-all duration-300 ${i <= idx ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-500"}`}
          >
            {i + 1}
          </span>
          <span
            className={`font-semibold text-xs sm:text-sm ${i === idx ? "text-slate-950 block" : "hidden sm:inline text-slate-400"}`}
          >
            {s.label}
          </span>
          {i < steps.length - 1 && (
            <span className="text-slate-200 font-light ml-1 sm:ml-2">/</span>
          )}
        </li>
      ))}
    </ol>
  );
}

function Browse(props: {
  services: Service[];
  categories: string[];
  typeFilter: "all" | "free" | "paid";
  setTypeFilter: (v: any) => void;
  catFilter: string;
  setCatFilter: (v: string) => void;
  onPick: (s: Service) => void;
}) {
  return (
    <section className="animate-fade-in-up">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Choose a service</h1>
          <p className="text-sm text-slate-500 mt-1">
            Select the type of appointment you would like to book.
          </p>
        </div>
        <div className="flex flex-wrap gap-2.5">
          <Select
            value={props.typeFilter}
            onChange={(v) => props.setTypeFilter(v)}
            options={[
              ["all", "All Types"],
              ["free", "Free Slots"],
              ["paid", "Paid Slots"],
            ]}
          />
          <Select
            value={props.catFilter}
            onChange={props.setCatFilter}
            options={[
              ["all", "All Categories"],
              ...props.categories.map<[string, string]>((c) => [c, c]),
            ]}
          />
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        {props.services.map((s) => (
          <a
            key={s.id}
            href={`/?service=${s.id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="group block relative bg-white rounded-2xl border border-slate-200/80 p-6 text-left transition-all duration-300 hover:border-indigo-300 hover:shadow-lg hover:-translate-y-1"
          >
            <div className="mb-4 flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                {s.category}
              </span>
              <Badge type={s.type === "free" ? "free" : "paid"}>
                {s.type === "free" ? "Free" : `₹${s.price}`}
              </Badge>
            </div>

            {/* Category Icon */}
            <div className="h-10 w-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300 shadow-sm">
              {getServiceIcon(s.name)}
            </div>

            <h3 className="text-lg font-bold text-slate-800 transition-colors duration-200 group-hover:text-indigo-600">
              {s.name}
            </h3>
            <p className="mt-1.5 text-sm text-slate-600 line-clamp-2 min-h-[40px]">
              {s.description || "No description provided."}
            </p>

            <div className="mt-4 pt-4 border-t border-slate-100 flex gap-4 text-xs font-semibold text-slate-500">
              <span className="flex items-center gap-1">
                <svg
                  className="h-4 w-4 text-slate-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                {s.duration} min
              </span>
              <span className="flex items-center gap-1">
                <svg
                  className="h-4 w-4 text-slate-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                  />
                </svg>
                Max {s.maxAttendees} attendees
              </span>
            </div>
          </a>
        ))}
        {props.services.length === 0 && (
          <div className="sm:col-span-2 text-center py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
            <p className="text-sm text-slate-500 font-medium">
              No services match your active filters.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}

function Select<T extends string>({
  value,
  onChange,
  options,
}: {
  value: T;
  onChange: (v: T) => void;
  options: [T, string][];
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as T)}
        className="appearance-none rounded-xl border border-slate-200 bg-white pl-4 pr-10 py-2.5 text-sm font-semibold text-slate-700 focus:border-indigo-500 focus:outline-none shadow-sm cursor-pointer hover:bg-slate-50/50 transition"
      >
        {options.map(([v, l]) => (
          <option key={v} value={v}>
            {l}
          </option>
        ))}
      </select>
      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-slate-500">
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </div>
  );
}

function Badge({
  type,
  children,
}: {
  type: "free" | "paid" | "active" | "inactive" | "pending" | "confirmed" | "cancelled";
  children: React.ReactNode;
}) {
  const cls = {
    free: "bg-emerald-50 text-emerald-700 border-emerald-100",
    paid: "bg-indigo-50 text-indigo-700 border-indigo-100",
    active: "bg-emerald-50 text-emerald-700 border-emerald-100",
    inactive: "bg-slate-100 text-slate-600 border-slate-200",
    pending: "bg-amber-50 text-amber-700 border-amber-100",
    confirmed: "bg-emerald-50 text-emerald-700 border-emerald-100",
    cancelled: "bg-rose-50 text-rose-700 border-rose-100",
  }[type];
  return (
    <span className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-bold ${cls}`}>
      {children}
    </span>
  );
}

function DateTimeStep({
  service,
  date,
  setDate,
  time,
  setTime,
  onBack,
  onNext,
}: {
  service: Service;
  date: string;
  setDate: (s: string) => void;
  time: string;
  setTime: (s: string) => void;
  onBack: () => void;
  onNext: () => void;
}) {
  const [month, setMonth] = useState(() => {
    const d = new Date();
    return { y: d.getFullYear(), m: d.getMonth() };
  });
  const days = useMemo(() => buildMonth(month.y, month.m), [month]);
  const slots = useMemo(() => (date ? getSlots(date, service) : []), [date, service]);
  const av = store.get().availability;
  const todayStr = new Date().toISOString().slice(0, 10);

  return (
    <section className="animate-fade-in-up">
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Select Date & Time</h1>
        <p className="text-sm text-slate-500 mt-1">
          {service.name} · {service.duration} min session
        </p>
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-3 sm:p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <button
              onClick={() =>
                setMonth(({ y, m }) => (m === 0 ? { y: y - 1, m: 11 } : { y, m: m - 1 }))
              }
              className="rounded-lg p-1.5 hover:bg-slate-100 font-semibold text-slate-600 transition"
            >
              ←
            </button>
            <span className="text-sm font-bold text-slate-800">
              {new Date(month.y, month.m).toLocaleString(undefined, {
                month: "long",
                year: "numeric",
              })}
            </span>
            <button
              onClick={() =>
                setMonth(({ y, m }) => (m === 11 ? { y: y + 1, m: 0 } : { y, m: m + 1 }))
              }
              className="rounded-lg p-1.5 hover:bg-slate-100 font-semibold text-slate-600 transition"
            >
              →
            </button>
          </div>
          <div className="grid grid-cols-7 gap-1 text-center text-xs font-bold text-slate-400 mb-2">
            {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((d, i) => (
              <div key={i}>{d}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {days.map((d, i) => {
              if (!d) return <div key={i} />;
              const ds = d.iso;
              const dow = new Date(ds + "T00:00:00").getDay();
              const isPast = ds < todayStr;
              const isBlocked = av.blockedDates.includes(ds);
              const isWorking = av.workingDays.includes(dow);
              const disabled = isPast || isBlocked || !isWorking;
              const selected = ds === date;
              return (
                <button
                  key={i}
                  disabled={disabled}
                  onClick={() => {
                    setDate(ds);
                    setTime("");
                  }}
                  className={`aspect-square rounded-xl text-sm font-semibold transition-all duration-200 ${selected ? "bg-indigo-600 text-white shadow-md shadow-indigo-100" : disabled ? "text-slate-200 cursor-not-allowed" : "hover:bg-indigo-50 text-slate-700"}`}
                >
                  {d.day}
                </button>
              );
            })}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 shadow-sm">
          <h3 className="mb-4 text-sm font-bold text-slate-800">Available Slots</h3>
          {!date && (
            <div className="h-48 flex items-center justify-center border border-dashed border-slate-200 rounded-xl bg-slate-50/50">
              <p className="text-sm text-slate-400 font-medium">Select a date on the calendar.</p>
            </div>
          )}
          {date && slots.length === 0 && (
            <div className="h-48 flex items-center justify-center border border-dashed border-slate-200 rounded-xl bg-slate-50/50">
              <p className="text-sm text-slate-400 font-medium">No available slots on this day.</p>
            </div>
          )}
          {date && slots.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {slots.map((s) => (
                <button
                  key={s.time}
                  disabled={s.full}
                  onClick={() => setTime(s.time)}
                  className={`rounded-xl border py-3 text-sm font-semibold transition ${time === s.time ? "border-indigo-600 bg-indigo-600 text-white shadow-md shadow-indigo-100" : s.full ? "cursor-not-allowed border-slate-100 text-slate-200 bg-slate-50" : "border-slate-200 hover:border-indigo-400 hover:bg-indigo-50/10 text-slate-700"}`}
                >
                  {s.time}
                  {s.full && (
                    <span className="ml-1 text-[9px] uppercase font-bold text-rose-500">full</span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
      <Actions onBack={onBack} onNext={onNext} nextDisabled={!date || !time} />
    </section>
  );
}

function buildMonth(y: number, m: number) {
  const first = new Date(y, m, 1);
  const startPad = first.getDay();
  const daysInMonth = new Date(y, m + 1, 0).getDate();
  const out: ({ day: number; iso: string } | null)[] = [];
  for (let i = 0; i < startPad; i++) out.push(null);
  for (let d = 1; d <= daysInMonth; d++) {
    out.push({
      day: d,
      iso: `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`,
    });
  }
  return out;
}

function DetailsStep({ service, form, setForm, errors, onBack, onNext }: any) {
  return (
    <section className="animate-fade-in-up">
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Your details</h1>
        <p className="text-sm text-slate-500 mt-1">
          Please provide your contact information to submit the slot request.
        </p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Full Name" error={errors.name}>
          <input
            className={inp}
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="John Doe"
          />
        </Field>
        <Field label="Email Address" error={errors.email}>
          <input
            type="email"
            className={inp}
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            placeholder="john@example.com"
          />
        </Field>
        <Field label="Phone Number" error={errors.phone}>
          <input
            className={inp}
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            placeholder="+1 (555) 000-0000"
          />
        </Field>
        <Field label={`Attendees (1–${service.maxAttendees})`} error={errors.attendees}>
          <input
            type="number"
            min={1}
            max={service.maxAttendees}
            className={inp}
            value={form.attendees}
            onChange={(e) => setForm({ ...form, attendees: Number(e.target.value) })}
          />
        </Field>
        <div className="sm:col-span-2">
          <Field label="Notes or Special Requests (optional)">
            <textarea
              className={inp}
              rows={3}
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              placeholder="Share anything that helps us prepare..."
            />
          </Field>
        </div>
      </div>
      <Actions
        onBack={onBack}
        onNext={onNext}
        nextLabel={service.type === "paid" ? "Continue to payment" : "Submit slot request"}
      />
    </section>
  );
}
const inp =
  "w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 focus:outline-none transition shadow-sm bg-white placeholder-slate-400";

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-semibold text-slate-600 uppercase tracking-wide">
        {label}
      </span>
      {children}
      {error && <span className="mt-1 block text-xs font-semibold text-rose-600">{error}</span>}
    </label>
  );
}

function PaymentStep({ service, attendees, date, time, onBack, onPay, error }: any) {
  const total = service.price * attendees;
  return (
    <section className="animate-fade-in-up">
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Review & Pay</h1>
        <p className="text-sm text-slate-500 mt-1">
          Review the details and process payment securely.
        </p>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm max-w-md mx-auto">
        <Row k="Service Name" v={service.name} bold />
        <div className="my-3 border-t border-slate-100" />
        <Row k="Appointment Date" v={date} />
        <Row k="Scheduled Time" v={time} />
        <Row k="Attendees" v={String(attendees)} />
        <div className="my-3 border-t border-slate-100" />
        <Row k="Price Per Attendee" v={`₹${service.price}`} />
        <div className="my-3 border-t border-slate-100" />
        <Row k="Total Amount Due" v={`₹${total}`} bold />
      </div>
      {error && <p className="mt-4 text-center text-sm font-semibold text-rose-600">{error}</p>}
      <Actions onBack={onBack} onNext={onPay} nextLabel={`Pay ₹${total}`} />
    </section>
  );
}

function Row({ k, v, bold }: { k: string; v: string; bold?: boolean }) {
  return (
    <div className="flex justify-between py-1.5 text-sm">
      <span className="text-slate-500 font-medium">{k}</span>
      <span className={bold ? "font-bold text-slate-900" : "font-semibold text-slate-700"}>
        {v}
      </span>
    </div>
  );
}

function ConfirmStep({
  booking,
  service,
  onNew,
  onManage,
  onJoinMeeting,
}: {
  booking: Booking;
  service: Service;
  onNew: () => void;
  onManage: () => void;
  onJoinMeeting: () => void;
}) {
  const [copiedLink, setCopiedLink] = useState(false);
  const shareText = encodeURIComponent(
    `Hi! I just requested a booking slot for *${service.name}*.\n\n` +
    `📅 *Date*: ${booking.date}\n` +
    `⏰ *Time*: ${booking.time}\n` +
    `🏷️ *Ref ID*: ${booking.id}\n\n` +
    `Waiting for confirmation! Check it out at: http://booking.twinstdio.com/`,
  );
  const whatsappUrl = `https://api.whatsapp.com/send?text=${shareText}`;

  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(
    booking.status === "confirmed"
      ? `${window.location.origin}/?meeting=${booking.id}`
      : `${window.location.origin}/?ref=${booking.id}&email=${booking.email}`,
  )}`;

  const printTicket = () => {
    const printContent = document.getElementById("booking-ticket-wrapper");
    if (!printContent) return;
    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Booking Ticket - ${booking.id}</title>
            <script src="https://cdn.tailwindcss.com"></script>
            <style>
              * {
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
              }
              body {
                background: #0c071e !important;
                display: flex;
                align-items: center;
                justify-content: center;
                min-height: 100vh;
                padding: 20px;
                font-family: sans-serif;
              }
              @media print {
                body {
                  background: #0c071e !important;
                  min-height: auto;
                  padding: 0;
                }
              }
            </style>
          </head>
          <body>
            <div class="w-full max-w-md p-6 bg-[#0c071e] rounded-3xl">
              ${printContent.innerHTML}
            </div>
            <script>
              window.onload = function() {
                window.print();
                setTimeout(function() { window.close(); }, 500);
              };
            </script>
          </body>
        </html>
      `);
      printWindow.document.close();
    }
  };

  return (
    <section className="text-center animate-fade-in-up">
      <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-amber-50 text-amber-600 text-2xl border border-amber-100 shadow-sm animate-pulse">
        ⚡
      </div>

      {booking.status === "confirmed" ? (
        <>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">
            Appointment Confirmed!
          </h1>
          <p className="mt-2 text-sm text-slate-600 max-w-md mx-auto leading-relaxed mb-6">
            Your appointment has been approved. You can join the virtual video meeting at the
            scheduled time.
          </p>
          <div className="max-w-md mx-auto mb-8">
            <button
              onClick={onJoinMeeting}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-6 py-3.5 text-sm font-bold text-white hover:bg-emerald-700 transition w-full shadow-lg shadow-emerald-100"
            >
              📹 Join Live Meeting Room
            </button>
          </div>
        </>
      ) : (
        <>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">
            Request Received!
          </h1>
          <p className="mt-2 text-sm text-slate-600 max-w-md mx-auto leading-relaxed mb-8">
            Your slot request is pending verification. Please wait for the confirmation email before
            attending.
          </p>
        </>
      )}

      {/* Ticket Wrapper */}
      <div className="bg-[#0c071e] p-6 md:p-10 rounded-3xl max-w-md mx-auto mb-8 shadow-2xl relative overflow-hidden">
        <div id="booking-ticket-wrapper" className="w-full">
          {/* Elongated Single Ticket Card */}
          <div className="relative w-full bg-white rounded-3xl shadow-lg text-left flex flex-col overflow-hidden border border-slate-100">
            {/* Perforated Notches */}
            <div className="absolute top-[58%] -left-3.5 w-7 h-7 rounded-full bg-[#0c071e] border-r border-slate-100/10"></div>
            <div className="absolute top-[58%] -right-3.5 w-7 h-7 rounded-full bg-[#0c071e] border-l border-slate-100/10"></div>

            {/* Header: Royal violet gradient */}
            <div className="bg-gradient-to-r from-[#2d1266] to-[#4c1d95] py-5 px-6 text-center shadow-inner">
              <span className="text-[#efdd2f] text-lg sm:text-xl font-black tracking-wider block">
                {booking.status === "confirmed" ? "APPOINTMENT PASS" : "REQUEST RECEIVED!"}
              </span>
            </div>

            {/* Body Section 1: Core Details */}
            <div className="p-6 pb-4">
              <h2 className="text-2xl sm:text-3xl font-black text-[#1d0e40] uppercase tracking-tight leading-none mb-3 break-words">
                {service.name}
              </h2>
              <span className="inline-block bg-[#fdf06f] text-slate-900 text-xs font-black px-2.5 py-1 rounded-md mb-6">
                Ref ID: {booking.id}
              </span>

              {/* 2x2 Grid details */}
              <div className="grid grid-cols-2 gap-x-4 gap-y-5 text-left">
                <div>
                  <span className="text-[#51359c] text-[10px] font-black uppercase tracking-wider block mb-1">
                    DATE:
                  </span>
                  <span className="inline-block bg-[#fdf06f] text-slate-900 font-bold px-2.5 py-1 rounded text-xs tracking-wider">
                    {booking.date}
                  </span>
                </div>
                <div>
                  <span className="text-[#51359c] text-[10px] font-black uppercase tracking-wider block mb-1">
                    TIME:
                  </span>
                  <span className="inline-block bg-[#fdf06f] text-slate-900 font-bold px-2.5 py-1 rounded text-xs tracking-wider">
                    {booking.time}
                  </span>
                </div>
                <div>
                  <span className="text-[#51359c] text-[10px] font-black uppercase tracking-wider block mb-1">
                    CLIENT:
                  </span>
                  <span className="inline-block bg-[#fdf06f] text-slate-900 font-bold px-2.5 py-1 rounded text-xs truncate max-w-full block">
                    {booking.clientName}
                  </span>
                </div>
                <div>
                  <span className="text-[#51359c] text-[10px] font-black uppercase tracking-wider block mb-1">
                    ATTENDEES:
                  </span>
                  <span className="inline-block bg-[#fdf06f] text-slate-900 font-bold px-2.5 py-1 rounded text-xs block">
                    {booking.attendees} Person(s)
                  </span>
                </div>
              </div>
            </div>

            {/* Perforation dashed separator */}
            <div className="border-t-2 border-dashed border-slate-200 mx-6 my-4"></div>

            {/* Body Section 2: Verification QR & Barcode */}
            <div className="px-6 pb-6 pt-2 flex flex-col items-center text-center">
              {/* Status banner */}
              <div className="w-full bg-slate-50 border border-slate-100 rounded-xl py-2.5 px-4 mb-5">
                <span className="text-[10px] text-[#51359c] font-black uppercase tracking-widest block mb-0.5">
                  STATUS
                </span>
                <span
                  className={`text-sm font-black uppercase tracking-wide ${booking.status === "confirmed" ? "text-emerald-600" : "text-amber-600"}`}
                >
                  {booking.status === "confirmed" ? "CONFIRMED & READY" : "AWAITING CONFIRMATION"}
                </span>
              </div>

              {/* QR Code */}
              <img
                src={qrUrl}
                className="w-36 h-36 object-contain border border-slate-100 p-2 rounded-2xl shadow-sm mb-3"
                alt="Verification QR Code"
              />
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-5">
                {booking.status === "confirmed"
                  ? "Scan to join video meeting directly"
                  : "Scan to view details or check status"}
              </span>

              {/* Barcode graphic */}
              <div className="flex justify-center items-center gap-[2.5px] h-12 w-full opacity-95 mb-1.5 px-4">
                {[
                  1, 3, 2, 4, 1, 2, 3, 1, 4, 2, 1, 3, 2, 4, 1, 2, 1, 3, 2, 4, 1, 2, 1, 3, 2, 4, 1,
                  2, 3,
                ].map((w, i) => (
                  <div key={i} className="bg-slate-900 h-full" style={{ width: `${w}px` }}></div>
                ))}
              </div>
              <span className="text-[9px] font-mono text-slate-400 block tracking-[0.25em] uppercase">
                TICKET NO: {booking.id}
              </span>
            </div>

            {/* Stub Yellow footer bar with logo.png */}
            <div className="bg-[#efdd2f] py-4 px-6 flex justify-center items-center w-full">
              <img src={logoImg} alt="Logo" className="h-7 w-auto object-contain" />
            </div>
          </div>
        </div>
      </div>

      {/* Ticket Operations */}
      <div className="flex flex-col sm:flex-row justify-center gap-3 mb-8 max-w-md mx-auto px-4">
        <button
          onClick={() => {
            const link = booking.status === "confirmed"
              ? `${window.location.origin}/?meeting=${booking.id}`
              : `${window.location.origin}/?ref=${booking.id}&email=${booking.email}`;
            navigator.clipboard.writeText(link);
            setCopiedLink(true);
            setTimeout(() => setCopiedLink(false), 2000);
          }}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition shadow-sm active:scale-95 w-full cursor-pointer"
        >
          {copiedLink ? (
            <>
              <Check className="h-4 w-4 text-emerald-600 animate-pulse" />
              <span>Copied!</span>
            </>
          ) : (
            <>
              <Copy className="h-4 w-4 text-slate-500" />
              <span>Copy Link</span>
            </>
          )}
        </button>
        <button
          onClick={printTicket}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition shadow-sm active:scale-95 w-full"
        >
          <svg
            className="h-4 w-4 text-slate-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
            />
          </svg>
          Download / Print Ticket
        </button>
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white hover:bg-emerald-700 transition shadow-sm active:scale-95 w-full"
        >
          <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
            <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.003 5.37 5.378 0 12.022 0a11.96 11.96 0 0 1 8.529 3.525c3.314 3.32 5.138 7.733 5.138 12.429 0 6.634-5.375 12.014-12.024 12.014-2.003 0-3.973-.5-5.713-1.448L0 24zm6.59-4.846c1.66.986 3.292 1.48 4.743 1.481 5.352 0 9.704-4.325 9.706-9.637a9.56 9.56 0 0 0-2.825-6.84 9.65 9.65 0 0 0-6.877-2.84c-5.358 0-9.711 4.325-9.714 9.638a9.49 9.49 0 0 0 1.448 5.01l-.997 3.637 3.79-.982-.379-.212z" />
          </svg>
          Share on WhatsApp
        </a>
      </div>

      <div className="flex flex-col sm:flex-row justify-center gap-2 border-t border-slate-100 pt-6 max-w-md mx-auto px-4">
        <button onClick={onManage} className={`${btnGhost} w-full`}>
          Manage my booking
        </button>
        <button onClick={onNew} className={`${btnGhost} w-full`}>
          Book another
        </button>
      </div>
    </section>
  );
}

function ManageBooking({
  lookup,
  setLookup,
  onLookup,
  err,
  booking,
  onReschedule,
  onCancel,
  onJoinMeeting,
}: any) {
  const svc = booking ? store.get().services.find((s) => s.id === booking.serviceId) : null;
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (booking) {
      navigator.clipboard.writeText(booking.id);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in-up">
      {/* Lookup Card */}
      <div className="backdrop-blur-md bg-white/75 rounded-2xl border border-slate-200/40 p-6 md:p-8 shadow-xl shadow-slate-100/40 max-w-xl mx-auto">
        <div className="flex items-center gap-3 mb-4">
          <div className="h-10 w-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
            <Search className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">Manage your booking</h2>
            <p className="text-xs text-slate-500">
              Track status, reschedule, or cancel your consultations
            </p>
          </div>
        </div>

        <div className="grid gap-4 mt-6">
          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1.5">
              Reference ID
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                <Hash className="h-4 w-4" />
              </span>
              <input
                className={`${inp} pl-10`}
                value={lookup.ref}
                onChange={(e: any) => setLookup({ ...lookup, ref: e.target.value })}
                placeholder="e.g. TX-XXXXX"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                <Mail className="h-4 w-4" />
              </span>
              <input
                className={`${inp} pl-10`}
                value={lookup.email}
                onChange={(e: any) => setLookup({ ...lookup, email: e.target.value })}
                placeholder="you@example.com"
              />
            </div>
          </div>

          <button
            onClick={onLookup}
            className={`${btnPrimary} w-full mt-2 shadow-md shadow-indigo-105 flex items-center justify-center gap-2`}
          >
            <span>Find my booking</span>
            <ArrowRight className="h-4 w-4" />
          </button>

          {err && (
            <div className="flex items-center gap-2 p-3.5 rounded-xl bg-rose-50 border border-rose-100 text-rose-600 mt-2 text-sm font-medium animate-shake">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{err}</span>
            </div>
          )}
        </div>
      </div>

      {/* Booking Detail Dashboard Card */}
      {booking && svc && (
        <div className="backdrop-blur-md bg-white/75 rounded-2xl border border-slate-200/50 shadow-xl shadow-slate-150/40 max-w-2xl mx-auto overflow-hidden animate-fade-in-up">
          {/* Header Banner representing status */}
          <div
            className={`p-6 border-b flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
              booking.status === "confirmed"
                ? "bg-emerald-50/50 border-emerald-100"
                : booking.status === "cancelled"
                  ? "bg-rose-50/40 border-rose-100"
                  : "bg-amber-50/50 border-amber-100"
            }`}
          >
            <div className="flex items-start gap-3">
              <div
                className={`p-2 rounded-xl mt-0.5 ${
                  booking.status === "confirmed"
                    ? "bg-emerald-100 text-emerald-700"
                    : booking.status === "cancelled"
                      ? "bg-rose-100 text-rose-700"
                      : "bg-amber-100 text-amber-700"
                }`}
              >
                {booking.status === "confirmed" ? (
                  <CheckCircle className="h-5 w-5" />
                ) : booking.status === "cancelled" ? (
                  <XCircle className="h-5 w-5" />
                ) : (
                  <Clock className="h-5 w-5" />
                )}
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                  Current Status
                </span>
                <h3 className="font-bold text-slate-800 text-lg sm:text-xl">{svc.name}</h3>
              </div>
            </div>
            <div>
              <Badge type={booking.status}>
                {booking.status === "pending" ? "Awaiting Confirmation" : booking.status}
              </Badge>
            </div>
          </div>

          <div className="p-6 md:p-8 space-y-6">
            {/* Main Info Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Reference Code
                </span>
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono font-bold text-slate-850 text-sm select-all">
                    {booking.id}
                  </span>
                  <button
                    onClick={handleCopy}
                    className="p-1.5 hover:bg-slate-200/80 rounded-lg text-slate-500 transition active:scale-90"
                    title="Copy Reference ID"
                  >
                    {copied ? (
                      <Check className="h-3.5 w-3.5 text-emerald-650" />
                    ) : (
                      <Copy className="h-3.5 w-3.5" />
                    )}
                  </button>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Attendees
                </span>
                <div className="flex items-center gap-2 text-slate-805 text-sm font-semibold">
                  <Users className="h-4 w-4 text-slate-500" />
                  <span>
                    {booking.attendees} {booking.attendees === 1 ? "person" : "people"}
                  </span>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Scheduled Date
                </span>
                <div className="flex items-center gap-2 text-slate-805 text-sm font-semibold">
                  <Calendar className="h-4 w-4 text-indigo-500" />
                  <span>{booking.date}</span>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Scheduled Time
                </span>
                <div className="flex items-center gap-2 text-slate-805 text-sm font-semibold">
                  <Clock className="h-4 w-4 text-indigo-500" />
                  <span>{booking.time}</span>
                </div>
              </div>
            </div>

            {/* Custom Notes Section */}
            {booking.notes && (
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Your Notes
                </span>
                <p className="text-sm text-slate-600 leading-relaxed italic">"{booking.notes}"</p>
              </div>
            )}

            {/* Banner details for Confirmed Booking (Join Meeting) */}
            {booking.status === "confirmed" && (
              <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-50/80 to-teal-50/50 border border-emerald-100 text-center space-y-3">
                <div className="flex flex-col items-center gap-1">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-semibold text-emerald-600 mb-1 animate-pulse">
                    ● Room Open
                  </span>
                  <p className="text-sm font-bold text-slate-800">Your live meeting room is ready!</p>
                  <p className="text-xs text-slate-500 max-w-md">
                    Click the button below to join your meeting. Please check that your camera and
                    microphone are working.
                  </p>
                </div>
                <button
                  onClick={() => onJoinMeeting(booking)}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-bold text-white hover:bg-emerald-700 transition w-full shadow-md shadow-emerald-100/50 hover:shadow-lg active:scale-95 cursor-pointer"
                >
                  <Video className="h-4.5 w-4.5 animate-pulse" />
                  <span>Join Live Meeting Room</span>
                </button>
              </div>
            )}

            {/* Warning Banner for Pending */}
            {booking.status === "pending" && (
              <div className="p-4 rounded-xl bg-amber-50/80 border border-amber-100/80 text-left flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="text-sm font-bold text-amber-800">Pending Host Confirmation</p>
                  <p className="text-xs text-amber-700/90 leading-relaxed">
                    We've received your booking request. Our team is checking availability and will
                    approve your request shortly. You'll receive a confirmation email.
                  </p>
                </div>
              </div>
            )}

            {/* Warning Banner for Cancelled */}
            {booking.status === "cancelled" && (
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-left flex items-start gap-3">
                <XCircle className="h-5 w-5 text-slate-500 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="text-sm font-bold text-slate-700">Booking Cancelled</p>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    This booking reference has been marked as cancelled. If you believe this was an
                    error or wish to request a new session, please browse the calendar.
                  </p>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            {booking.status !== "cancelled" && (
              <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row gap-2">
                <button
                  onClick={() => onReschedule(booking)}
                  className={`${btnPrimary} flex-1 flex items-center justify-center gap-2`}
                >
                  <Calendar className="h-4 w-4" />
                  <span>Reschedule Appointment</span>
                </button>
                {!booking.createdByAdmin && (
                  <button
                    onClick={() => onCancel(booking)}
                    className={`${btnDanger} flex-1 flex items-center justify-center gap-2`}
                  >
                    <XCircle className="h-4 w-4" />
                    <span>Cancel Appointment</span>
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function Actions({
  onBack,
  onNext,
  nextLabel = "Continue",
  nextDisabled,
}: {
  onBack: () => void;
  onNext: () => void;
  nextLabel?: string;
  nextDisabled?: boolean;
}) {
  return (
    <div className="mt-8 flex flex-col sm:flex-row gap-3 border-t border-slate-100 pt-6">
      <button onClick={onBack} className={`${btnGhost} w-full sm:w-auto order-2 sm:order-1`}>
        ← Back
      </button>
      <button
        onClick={onNext}
        disabled={nextDisabled}
        className={`${btnPrimary} w-full sm:w-auto order-1 sm:order-2 disabled:cursor-not-allowed disabled:opacity-50 truncate`}
      >
        {nextLabel}
      </button>
    </div>
  );
}

function Footer({
  onView,
  onLegal,
}: {
  onView: (v: "book" | "manage") => void;
  onLegal: (v: "privacy" | "terms") => void;
}) {
  return (
    <footer className="relative z-10 mt-auto border-t border-slate-200 bg-white py-12 text-slate-500 shadow-inner">
      <div className="mx-auto max-w-6xl px-4 grid gap-8 sm:grid-cols-2 md:grid-cols-4">
        <div className="flex flex-col gap-3">
          <div className="flex items-center">
            <img src={logoImg} alt="Logo" className="h-6 w-auto object-contain" />
          </div>
          <p className="text-sm text-slate-400 leading-relaxed">
            Beautiful, real-time consultation scheduling software with integrated payments and
            automated notification templates.
          </p>
        </div>
        <div>
          <h4 className="text-xs font-bold text-slate-900 mb-3.5 uppercase tracking-wider">
            Appointments
          </h4>
          <ul className="grid gap-2 text-sm">
            <li>
              <button
                onClick={() => onView("book")}
                className="hover:text-indigo-600 transition font-medium"
              >
                Book a Session
              </button>
            </li>
            <li>
              <button
                onClick={() => onView("manage")}
                className="hover:text-indigo-600 transition font-medium"
              >
                My Booking State
              </button>
            </li>
          </ul>
        </div>
        <div>
          <h4 className="text-xs font-bold text-slate-900 mb-3.5 uppercase tracking-wider">
            Resources
          </h4>
          <ul className="grid gap-2 text-sm">
            <li>
              <a
                href="https://www.twinstdio.com"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-indigo-600 transition font-medium"
              >
                Website
              </a>
            </li>
            <li>
              <a
                href="https://appointment-api.twinstdio.com/api/availability"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-indigo-600 transition font-medium"
              >
                Live API Availability
              </a>
            </li>
          </ul>
        </div>
        <div>
          <h4 className="text-xs font-bold text-slate-900 mb-3.5 uppercase tracking-wider">
            Contact
          </h4>
          <p className="text-sm text-slate-400 leading-relaxed">
            Need scheduling help?
            <br />
            <span className="text-indigo-600 hover:underline font-semibold cursor-pointer">
              support@twinstdio.com
            </span>
          </p>
        </div>
      </div>
      <div className="mx-auto max-w-6xl px-4 mt-8 pt-8 border-t border-slate-100 flex flex-wrap justify-between items-center gap-4">
        <span className="text-xs text-slate-400">
          &copy; 2026. All rights reserved. <span className="mx-2 text-slate-300">|</span> Powered
          by{" "}
          <a
            href="https://twinstdio.com"
            target="_blank"
            rel="noopener noreferrer"
            className="font-bold text-slate-700 hover:text-indigo-600 transition"
          >
            twinstdio
          </a>
        </span>
        <div className="flex gap-4 text-xs text-slate-400">
          <button
            onClick={() => onLegal("privacy")}
            className="hover:text-slate-600 transition cursor-pointer font-medium"
          >
            Privacy Policy
          </button>
          <button
            onClick={() => onLegal("terms")}
            className="hover:text-slate-600 transition cursor-pointer font-medium"
          >
            Terms of Service
          </button>
        </div>
      </div>
    </footer>
  );
}

export const btnPrimary =
  "inline-flex items-center justify-center rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white transition-all duration-300 hover:bg-indigo-700 hover:shadow-lg active:scale-95";
export const btnGhost =
  "inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition active:scale-95";
export const btnDanger =
  "inline-flex items-center justify-center rounded-xl bg-rose-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-rose-700 transition active:scale-95";
