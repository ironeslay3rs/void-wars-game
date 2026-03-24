export type FriendPresence = "online" | "busy" | "offline";

export type FriendShellEntry = {
  id: string;
  callsign: string;
  title: string;
  faction: "Bio" | "Mecha" | "Pure";
  presence: FriendPresence;
  note: string;
  statusLine: string;
};

export type ChatShellMessage = {
  id: string;
  sender: "friend" | "self";
  text: string;
  timestamp: string;
};

export type MailAttachment = {
  id: string;
  label: string;
  type: "reward" | "document";
  detail: string;
};

export type MailEntry = {
  id: string;
  sender: string;
  subject: string;
  category: string;
  receivedAt: string;
  unread: boolean;
  preview: string;
  body: string[];
  attachments: MailAttachment[];
};

export const friendShellEntries: FriendShellEntry[] = [
  {
    id: "fen-watch",
    callsign: "Fen Watch",
    title: "Outer Trench Scout",
    faction: "Bio",
    presence: "online",
    note: "Active beyond the district wall. Ready for field regrouping.",
    statusLine: "Signal clean. Ready for contact.",
  },
  {
    id: "synod-9",
    callsign: "Synod-9",
    title: "Frame Keeper",
    faction: "Mecha",
    presence: "busy",
    note: "Locked in repair rotation. Replies are slow but still live.",
    statusLine: "Occupied in mecha maintenance.",
  },
  {
    id: "ember-lark",
    callsign: "Ember Lark",
    title: "Rune Courier",
    faction: "Pure",
    presence: "offline",
    note: "Last trace came from the lower vault stairs two nights ago.",
    statusLine: "No recent signal.",
  },
  {
    id: "grave-thread",
    callsign: "Grave Thread",
    title: "Citadel Broker",
    faction: "Bio",
    presence: "online",
    note: "Trading route gossip and trench reports through neutral channels.",
    statusLine: "Watching the board now.",
  },
];

export const friendChatShellMessages: Record<string, ChatShellMessage[]> = {
  "fen-watch": [
    {
      id: "fen-1",
      sender: "friend",
      text: "Wall signal is stable. If you move tonight, take the lower trench route.",
      timestamp: "18:42",
    },
    {
      id: "fen-2",
      sender: "self",
      text: "Copy. Checking condition and hunger before I commit.",
      timestamp: "18:44",
    },
    {
      id: "fen-3",
      sender: "friend",
      text: "Good. The city eats the careless before the Void does.",
      timestamp: "18:45",
    },
  ],
  "synod-9": [
    {
      id: "synod-1",
      sender: "friend",
      text: "Repair lattice is occupied. Leave your mark request and I will answer when the frame clears.",
      timestamp: "07:10",
    },
    {
      id: "synod-2",
      sender: "self",
      text: "Understood. Holding until your board opens.",
      timestamp: "07:12",
    },
  ],
  "ember-lark": [
    {
      id: "ember-1",
      sender: "self",
      text: "Leaving a trace here. Reply when you surface from the lower vaults.",
      timestamp: "2 days ago",
    },
  ],
  "grave-thread": [
    {
      id: "grave-1",
      sender: "friend",
      text: "Neutral brokers are hearing Black Market traffic again. Feast Hall is moving more bodies than usual.",
      timestamp: "22:03",
    },
    {
      id: "grave-2",
      sender: "self",
      text: "That means survival pressure is getting worse, not better.",
      timestamp: "22:07",
    },
  ],
};

export const mailEntries: MailEntry[] = [
  {
    id: "quartermaster-ledger",
    sender: "Citadel Quartermaster",
    subject: "Salvage Ledger Revision",
    category: "Logistics",
    receivedAt: "Today / 06:12",
    unread: true,
    preview: "Your last field return has been entered into the lower ledgers.",
    body: [
      "Operative, your last return from the outer districts has been entered into the salvage book.",
      "No discrepancies were found in the haul count. The Citadel will hold the record until you require a formal audit.",
      "Attached below: ledger abstract and a placeholder recovery chit for future system wiring.",
    ],
    attachments: [
      {
        id: "ledger-abstract",
        label: "Ledger Abstract",
        type: "document",
        detail: "Archival document placeholder only.",
      },
      {
        id: "recovery-chit",
        label: "Recovery Chit",
        type: "reward",
        detail: "Presentational reward placeholder only.",
      },
    ],
  },
  {
    id: "broker-circular",
    sender: "Neutral Broker Circle",
    subject: "Black Market Circular",
    category: "Citadel Notice",
    receivedAt: "Yesterday / 22:03",
    unread: false,
    preview: "Feast Hall traffic is rising. Terms remain fixed under market law.",
    body: [
      "Traffic through the Black Market has increased, especially through Gluttony and Feast Hall.",
      "Terms remain fixed. The market will not recognize panic as a bargaining right.",
      "This circular is archived for awareness only and carries no live claim path in the current build.",
    ],
    attachments: [
      {
        id: "market-bulletin",
        label: "Market Bulletin",
        type: "document",
        detail: "Reference notice placeholder only.",
      },
    ],
  },
  {
    id: "field-trace",
    sender: "Outer Wall Relay",
    subject: "Recovered Field Trace",
    category: "Signal Record",
    receivedAt: "2 days ago",
    unread: false,
    preview: "A delayed relay packet has been reconstructed from the trench network.",
    body: [
      "A partial signal packet was recovered from the trench relay grid and reconstructed for archive review.",
      "Most of the live routing data was lost before recovery. What remains is a record, not an active contact thread.",
      "Attached below: one signal fragment placeholder held only as a visual shell.",
    ],
    attachments: [
      {
        id: "signal-fragment",
        label: "Signal Fragment",
        type: "document",
        detail: "Archival signal placeholder only.",
      },
    ],
  },
];
