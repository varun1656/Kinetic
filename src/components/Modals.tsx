import React, { useState } from 'react';
import {
  AlertTriangle,
  Check,
  Clock,
  Copy,
  Send,
  ShieldCheck,
  X,
} from 'lucide-react';
import { DriverProfile, LocationSelection } from '../types/ride';

interface SafetyModalProps {
  open: boolean;
  onClose: () => void;
  driver: DriverProfile | null;
  pickup: LocationSelection | null;
  destination: LocationSelection | null;
}

export const SafetyModal: React.FC<SafetyModalProps> = ({
  open,
  onClose,
  driver,
  pickup,
  destination,
}) => {
  const [copied, setCopied] = useState(false);
  const [sosTriggered, setSosTriggered] = useState(false);

  if (!open) return null;

  const shareText = `Kinetic Live Trip in Gurugram: ${pickup?.name ?? 'Pickup'} to ${
    destination?.name ?? 'Destination'
  }${driver ? ` · ${driver.vehicleModel} (${driver.plate})` : ''}`;

  const handleCopyLink = () => {
    navigator.clipboard?.writeText(shareText).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-lg bg-white dark:bg-[#121212] border border-[#E2E2E2] dark:border-[#262626] shadow-2xl p-5 space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-[#05A357]" />
            <h3 className="font-display text-lg font-bold text-[#1B1C1C] dark:text-white">
              Safety Hub
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close safety hub"
            className="p-2 rounded-full hover:bg-[#F3F3F3] dark:hover:bg-[#1F1F1F] text-[#767676]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-3.5 rounded bg-[#F6F6F6] dark:bg-[#1A1A1A] space-y-2 text-xs text-[#4C4546] dark:text-[#A1A1AA]">
          <div className="font-semibold text-[#1B1C1C] dark:text-white">
            Active Gurugram Trip Protections
          </div>
          <div className="flex items-center gap-2">
            <Check className="w-3.5 h-3.5 text-[#05A357]" />
            <span>GPS route monitoring & NH-48 / Golf Course corridor alerts</span>
          </div>
          <div className="flex items-center gap-2">
            <Check className="w-3.5 h-3.5 text-[#05A357]" />
            <span>4-digit PIN boarding verification & Haryana RTO plate check</span>
          </div>
        </div>

        <div className="space-y-2">
          <button
            type="button"
            onClick={handleCopyLink}
            className="w-full h-11 rounded bg-[#EEEEEE] hover:bg-[#E2E2E2] dark:bg-[#222222] dark:hover:bg-[#2E2E2E] text-black dark:text-white text-sm font-semibold flex items-center justify-center gap-2 transition-colors"
          >
            {copied ? <Check className="w-4 h-4 text-[#05A357]" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'Live trip status copied' : 'Share live trip status'}</span>
          </button>

          <button
            type="button"
            onClick={() => setSosTriggered((v) => !v)}
            className="w-full h-12 rounded bg-[#FDF2F2] hover:bg-[#FEE2E2] dark:bg-[#E11900]/15 dark:hover:bg-[#E11900]/25 text-[#E11900] text-sm font-semibold flex items-center justify-center gap-2 transition-colors"
          >
            <AlertTriangle className="w-4 h-4" />
            <span>
              {sosTriggered
                ? 'Emergency 112 & Gurugram Safety Team Alerted'
                : 'Emergency SOS · Dial 112'}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};

interface ScheduleModalProps {
  open: boolean;
  onClose: () => void;
  onConfirmSchedule: (slot: string) => void;
}

const TIME_SLOTS = [
  'Today, 10:30 AM',
  'Today, 11:15 AM',
  'Today, 1:00 PM',
  'Today, 5:30 PM',
  'Tomorrow, 8:30 AM',
  'Tomorrow, 9:15 AM',
];

export const ScheduleModal: React.FC<ScheduleModalProps> = ({
  open,
  onClose,
  onConfirmSchedule,
}) => {
  const [selected, setSelected] = useState(TIME_SLOTS[0]);
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm rounded-lg bg-white dark:bg-[#121212] border border-[#E2E2E2] dark:border-[#262626] shadow-2xl p-5 space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-black dark:text-white" />
            <h3 className="font-display text-lg font-bold text-[#1B1C1C] dark:text-white">
              Schedule pickup
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close schedule modal"
            className="p-2 rounded-full hover:bg-[#F3F3F3] dark:hover:bg-[#1F1F1F] text-[#767676]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-1.5">
          {TIME_SLOTS.map((slot) => (
            <button
              key={slot}
              type="button"
              onClick={() => setSelected(slot)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded text-sm font-medium transition-colors ${
                selected === slot
                  ? 'bg-black text-white dark:bg-white dark:text-black'
                  : 'bg-[#F6F6F6] text-[#1B1C1C] hover:bg-[#EAEAEA] dark:bg-[#1A1A1A] dark:text-white dark:hover:bg-[#242424]'
              }`}
            >
              <span>{slot}</span>
              {selected === slot && <Check className="w-4 h-4" />}
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={() => {
            onConfirmSchedule(selected);
            onClose();
          }}
          className="w-full h-11 rounded bg-black hover:bg-[#262626] dark:bg-white dark:hover:bg-[#E4E4E7] text-white dark:text-black text-sm font-semibold transition-colors"
        >
          Set pickup time
        </button>
      </div>
    </div>
  );
};

interface MessageModalProps {
  open: boolean;
  onClose: () => void;
  driver: DriverProfile;
}

const QUICK_REPLIES = [
  'I am waiting at the main gate',
  'Please call when you reach the tower',
  'On my way down now',
];

export const DriverMessageModal: React.FC<MessageModalProps> = ({ open, onClose, driver }) => {
  const [messages, setMessages] = useState<Array<{ from: 'rider' | 'driver'; text: string }>>([
    { from: 'driver', text: `On my way in ${driver.vehicleModel.split('·')[0].trim()}.` },
  ]);
  const [draft, setDraft] = useState('');

  if (!open) return null;

  const sendMessage = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;
    setMessages((prev) => [...prev, { from: 'rider', text: trimmed }]);
    setDraft('');
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        { from: 'driver', text: 'Got it, see you shortly.' },
      ]);
    }, 650);
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-lg bg-white dark:bg-[#121212] border border-[#E2E2E2] dark:border-[#262626] shadow-2xl p-5 space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-[#E2E2E2] dark:border-[#262626] pb-3">
          <div>
            <h3 className="font-display text-base font-bold text-[#1B1C1C] dark:text-white">
              Message {driver.name}
            </h3>
            <p className="text-xs text-[#767676] font-mono-tabular">{driver.plate}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close message drawer"
            className="p-2 rounded-full hover:bg-[#F3F3F3] dark:hover:bg-[#1F1F1F] text-[#767676]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-2 max-h-52 overflow-y-auto kinetic-scroll">
          {messages.map((m, i) => (
            <div
              key={i}
              className={`flex ${m.from === 'rider' ? 'justify-end' : 'justify-start'}`}
            >
              <span
                className={`px-3 py-2 rounded text-xs max-w-[80%] ${
                  m.from === 'rider'
                    ? 'bg-black text-white dark:bg-white dark:text-black'
                    : 'bg-[#F3F3F3] text-[#1B1C1C] dark:bg-[#1F1F1F] dark:text-white'
                }`}
              >
                {m.text}
              </span>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap gap-1.5">
          {QUICK_REPLIES.map((qr) => (
            <button
              key={qr}
              type="button"
              onClick={() => sendMessage(qr)}
              className="px-2.5 py-1 rounded bg-[#F6F6F6] hover:bg-[#E2E2E2] dark:bg-[#1A1A1A] dark:hover:bg-[#262626] text-xs font-medium text-[#1B1C1C] dark:text-white transition-colors"
            >
              {qr}
            </button>
          ))}
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            sendMessage(draft);
          }}
          className="flex gap-2"
        >
          <input
            type="text"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Send pickup note..."
            className="flex-1 h-10 px-3 rounded bg-[#F6F6F6] dark:bg-[#1A1A1A] text-sm text-[#1B1C1C] dark:text-white focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white"
          />
          <button
            type="submit"
            aria-label="Send message"
            className="w-10 h-10 rounded bg-black text-white dark:bg-white dark:text-black flex items-center justify-center shrink-0"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};

interface CancelModalProps {
  open: boolean;
  onClose: () => void;
  onConfirmCancel: () => void;
}

const CANCEL_REASONS = [
  'Wait time is too long',
  'Changed pickup or destination',
  'Booked by mistake',
  'Driver asked to cancel',
];

export const CancelRideModal: React.FC<CancelModalProps> = ({
  open,
  onClose,
  onConfirmCancel,
}) => {
  const [reason, setReason] = useState(CANCEL_REASONS[0]);
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm rounded-lg bg-white dark:bg-[#121212] border border-[#E2E2E2] dark:border-[#262626] shadow-2xl p-5 space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="space-y-1">
          <h3 className="font-display text-lg font-bold text-[#1B1C1C] dark:text-white">
            Cancel this ride?
          </h3>
          <p className="text-xs text-[#767676]">
            No cancellation fee applies right now. Select a reason below.
          </p>
        </div>

        <div className="space-y-1.5">
          {CANCEL_REASONS.map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setReason(r)}
              className={`w-full text-left px-3 py-2.5 rounded text-xs font-medium transition-colors ${
                reason === r
                  ? 'bg-black text-white dark:bg-white dark:text-black'
                  : 'bg-[#F6F6F6] text-[#1B1C1C] hover:bg-[#EAEAEA] dark:bg-[#1A1A1A] dark:text-white'
              }`}
            >
              {r}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-2 pt-1">
          <button
            type="button"
            onClick={onClose}
            className="h-11 rounded bg-[#EEEEEE] hover:bg-[#E2E2E2] dark:bg-[#222222] text-black dark:text-white text-xs font-semibold"
          >
            Keep ride
          </button>
          <button
            type="button"
            onClick={() => {
              onConfirmCancel();
              onClose();
            }}
            className="h-11 rounded bg-[#E11900] hover:bg-[#C01400] text-white text-xs font-semibold"
          >
            Confirm cancel
          </button>
        </div>
      </div>
    </div>
  );
};
