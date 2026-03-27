"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import BazaarSubpageNav from "@/components/bazaar/BazaarSubpageNav";
import { useAuth } from "@/features/auth/useAuth";
import { useGame } from "@/features/game/gameContext";
import { getAuctionPostableItems } from "@/features/auction/auctionItems";
import { getVoidRealtimeWebSocketUrl } from "@/lib/voidRealtimeWsUrl";
import type {
  AuctionAccountStateMessage,
  AuctionBuyListingMessage,
  AuctionCancelListingMessage,
  AuctionCreateListingMessage,
  AuctionHistoryMessage,
  AuctionHistoryEntry,
  AuctionListingSnapshot,
  AuctionListingsMessage,
  AuctionTradeEventMessage,
  RegisterAuctionMessage,
  ServerToClientMessage,
} from "@/features/void-maps/realtime/voidRealtimeProtocol";

function getOrCreateAuctionClientId() {
  if (typeof window === "undefined") return "auction-client";
  const key = "vw-auction-client-id";
  const existing = window.localStorage.getItem(key);
  if (existing) return existing;
  const next = `auction-${Date.now()}-${Math.floor(Math.random() * 10_000)}`;
  window.localStorage.setItem(key, next);
  return next;
}

export default function AuctionHousePage() {
  const { user } = useAuth();
  const { state, dispatch } = useGame();
  const { player } = state;
  const [clientId] = useState(() => getOrCreateAuctionClientId());
  const wsRef = useRef<WebSocket | null>(null);
  const shouldReconnectRef = useRef(true);
  const reconnectAttemptRef = useRef(0);
  const reconnectTimerRef = useRef<number | null>(null);
  const stateRef = useRef(state);
  const playerRef = useRef(player);
  const [connected, setConnected] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [listings, setListings] = useState<AuctionListingSnapshot[]>([]);
  const [history, setHistory] = useState<AuctionHistoryEntry[]>([]);
  const [postItemId, setPostItemId] = useState<string>("");
  const [postPrice, setPostPrice] = useState<string>("250");

  const postableItems = useMemo(() => getAuctionPostableItems(player), [player]);
  const selectedPostItem =
    postableItems.find((x) => x.id === postItemId) ?? postableItems[0] ?? null;

  useEffect(() => {
    stateRef.current = state;
    playerRef.current = state.player;
  }, [state]);

  useEffect(() => {
    function sendRegister(ws: WebSocket) {
      const snapshot = playerRef.current;
      const msg: RegisterAuctionMessage = {
        type: "register_auction",
        clientId,
        accountId: user?.id ?? `local-${snapshot.playerName.toLowerCase()}`,
        playerName: snapshot.playerName,
        credits: snapshot.resources.credits,
        craftedInventory: snapshot.craftedInventory,
      };
      ws.send(JSON.stringify(msg));
    }

    function scheduleReconnect() {
      if (!shouldReconnectRef.current) return;
      if (reconnectTimerRef.current !== null) return;
      const nextAttempt = reconnectAttemptRef.current + 1;
      reconnectAttemptRef.current = nextAttempt;
      const delayMs = Math.min(8000, 500 * 2 ** Math.min(nextAttempt, 4));
      reconnectTimerRef.current = window.setTimeout(() => {
        reconnectTimerRef.current = null;
        connect();
      }, delayMs);
    }

    function connect() {
      if (!shouldReconnectRef.current) return;
      const wsUrl = getVoidRealtimeWebSocketUrl();
      if (!wsUrl) {
        setConnected(false);
        setNotice("HTTPS: set NEXT_PUBLIC_VOID_WS_URL to your hosted websocket (wss://…).");
        return;
      }
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;
      ws.onopen = () => {
        reconnectAttemptRef.current = 0;
        setConnected(true);
        sendRegister(ws);
      };
      ws.onclose = () => {
        setConnected(false);
        scheduleReconnect();
      };
      ws.onerror = () => {
        setConnected(false);
        setNotice("Auction websocket disconnected.");
      };
      ws.onmessage = (ev) => {
        const msg = JSON.parse(ev.data) as ServerToClientMessage;
        if (msg.type === "auction_listings") {
          setListings((msg as AuctionListingsMessage).listings);
          return;
        }
        if (msg.type === "auction_account_state") {
          const acct = msg as AuctionAccountStateMessage;
          if (acct.clientId !== clientId) return;
          const currentState = stateRef.current;
          const currentPlayer = playerRef.current;
          dispatch({
            type: "HYDRATE_STATE",
            payload: {
              ...currentState,
              player: {
                ...currentPlayer,
                resources: {
                  ...currentPlayer.resources,
                  credits: acct.credits,
                },
                craftedInventory: acct.craftedInventory,
              },
            },
          });
          return;
        }
        if (msg.type === "auction_history") {
          const payload = msg as AuctionHistoryMessage;
          if (payload.clientId !== clientId) return;
          setHistory(payload.entries);
          return;
        }
        if (msg.type !== "auction_trade_event") return;
        const evt = msg as AuctionTradeEventMessage;
        if (evt.reason) setNotice(evt.reason);
        if (evt.status === "created") setNotice("Listing posted.");
        if (evt.status === "cancelled") setNotice("Listing cancelled.");
        if (evt.status === "sold") setNotice("Trade completed.");
      };
    }

    shouldReconnectRef.current = true;
    connect();

    return () => {
      shouldReconnectRef.current = false;
      if (reconnectTimerRef.current !== null) {
        window.clearTimeout(reconnectTimerRef.current);
        reconnectTimerRef.current = null;
      }
      wsRef.current?.close();
      wsRef.current = null;
    };
  }, [clientId, dispatch, user?.id]);

  useEffect(() => {
    const ws = wsRef.current;
    if (!ws || ws.readyState !== WebSocket.OPEN) return;
    const snapshot = playerRef.current;
    const msg: RegisterAuctionMessage = {
      type: "register_auction",
      clientId,
      accountId: user?.id ?? `local-${snapshot.playerName.toLowerCase()}`,
      playerName: snapshot.playerName,
      credits: snapshot.resources.credits,
      craftedInventory: snapshot.craftedInventory,
    };
    ws.send(JSON.stringify(msg));
  }, [clientId, player.playerName, player.resources.credits, player.craftedInventory, user?.id]);

  function sendMsg(
    msg:
      | AuctionCreateListingMessage
      | AuctionCancelListingMessage
      | AuctionBuyListingMessage,
  ) {
    const ws = wsRef.current;
    if (!ws || ws.readyState !== WebSocket.OPEN) {
      setNotice("Auction socket offline.");
      return false;
    }
    ws.send(JSON.stringify(msg));
    return true;
  }

  function postListing() {
    if (!selectedPostItem) return;
    const price = Math.max(1, Math.floor(Number(postPrice)));
    if (!Number.isFinite(price)) return;
    const msg: AuctionCreateListingMessage = {
      type: "auction_create_listing",
      clientId,
      listing: {
        itemId: selectedPostItem.id,
        itemName: selectedPostItem.name,
        itemType: selectedPostItem.itemType,
        rarity:
          selectedPostItem.rarity === "Rare"
            ? "Rare"
            : selectedPostItem.rarity === "Uncommon"
              ? "Uncommon"
              : "Common",
        tier: selectedPostItem.rankTier,
        priceCredits: price,
      },
    };
    const posted = sendMsg(msg);
    if (!posted) return;
  }

  function cancelListing(listingId: string) {
    const msg: AuctionCancelListingMessage = {
      type: "auction_cancel_listing",
      clientId,
      listingId,
    };
    sendMsg(msg);
  }

  function buyListing(listing: AuctionListingSnapshot) {
    if (listing.sellerClientId === clientId) return;
    if (player.resources.credits < listing.priceCredits) {
      setNotice("Not enough credits.");
      return;
    }
    const msg: AuctionBuyListingMessage = {
      type: "auction_buy_listing",
      clientId,
      listingId: listing.listingId,
    };
    sendMsg(msg);
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(90,60,20,0.22),rgba(5,8,18,1)_55%)] px-6 py-8 text-white md:px-10">
      <div className="mx-auto flex max-w-6xl flex-col gap-6">
        <div>
          <div className="text-[11px] uppercase tracking-[0.24em] text-amber-300/70">
            Bazaar / Economy
          </div>
          <h1 className="mt-2 text-3xl font-black uppercase tracking-[0.04em]">
            Auction House
          </h1>
          <p className="mt-2 max-w-3xl text-sm text-white/70">
            Player listings for ranked gear. Post crafted equipment, browse current market,
            and buy upgrades from other operatives.
          </p>
        </div>

        <BazaarSubpageNav accentClassName="hover:border-amber-400/40" />

        <div className="rounded-xl border border-white/10 bg-white/3 px-4 py-3 text-xs text-white/70">
          Socket:{" "}
          <span className={connected ? "text-emerald-300" : "text-red-300"}>
            {connected ? "linked" : "offline"}
          </span>
          {" · "}Credits: <span className="font-bold text-amber-200">{player.resources.credits}</span>
          {" · "}Listing fee: 5
          {" · "}Seller payout: 90%
          {notice ? <span className="ml-2 text-cyan-100">· {notice}</span> : null}
        </div>

        <section className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="rounded-2xl border border-white/12 bg-black/25 p-5">
            <div className="text-[11px] uppercase tracking-[0.2em] text-white/45">
              Post Listing
            </div>
            <div className="mt-3 space-y-3">
              <div className="rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-[11px] text-white/60">
                Active listings: {listings.filter((x) => x.sellerClientId === clientId).length}/8
              </div>
              <select
                value={selectedPostItem?.id ?? ""}
                onChange={(e) => setPostItemId(e.target.value)}
                className="w-full rounded-xl border border-white/12 bg-black/30 px-3 py-2 text-sm"
              >
                {postableItems.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name} · {item.rankTier} · {item.rarity}
                  </option>
                ))}
              </select>
              <input
                value={postPrice}
                onChange={(e) => setPostPrice(e.target.value)}
                type="number"
                min={1}
                className="w-full rounded-xl border border-white/12 bg-black/30 px-3 py-2 text-sm"
                placeholder="Price (credits)"
              />
              <button
                type="button"
                onClick={postListing}
                disabled={!selectedPostItem || !connected}
                className="w-full rounded-xl border border-cyan-400/30 bg-cyan-500/10 px-4 py-3 text-sm font-semibold text-cyan-100 disabled:opacity-40"
              >
                Post Listing
              </button>
            </div>
          </div>

          <div className="rounded-2xl border border-white/12 bg-black/25 p-5">
            <div className="text-[11px] uppercase tracking-[0.2em] text-white/45">
              Live Listings
            </div>
            <div className="mt-3 max-h-[60vh] space-y-2 overflow-y-auto">
              {listings.length === 0 ? (
                <div className="rounded-xl border border-dashed border-white/12 bg-white/2 px-4 py-8 text-center text-white/40">
                  No listings live.
                </div>
              ) : (
                listings.map((listing) => {
                  const mine = listing.sellerClientId === clientId;
                  return (
                    <div
                      key={listing.listingId}
                      className="rounded-xl border border-white/10 bg-white/3 p-3"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <div className="text-sm font-bold text-white">{listing.itemName}</div>
                          <div className="text-[11px] text-white/55">
                            {listing.itemType.toUpperCase()} · {listing.tier} · {listing.rarity}
                          </div>
                          <div className="text-[11px] text-white/45">
                            seller: {listing.sellerName}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-black text-amber-200">
                            {listing.priceCredits} cr
                          </div>
                          {mine ? (
                            <button
                              type="button"
                              onClick={() => cancelListing(listing.listingId)}
                              className="mt-2 rounded-lg border border-red-400/25 bg-red-500/10 px-2 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-red-100"
                            >
                              Cancel
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => buyListing(listing)}
                              className="mt-2 rounded-lg border border-emerald-400/25 bg-emerald-500/10 px-2 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-emerald-100"
                            >
                              Buy
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-white/12 bg-black/25 p-5">
          <div className="text-[11px] uppercase tracking-[0.2em] text-white/45">
            Trade History
          </div>
          <div className="mt-3 max-h-[34vh] space-y-2 overflow-y-auto">
            {history.length === 0 ? (
              <div className="rounded-xl border border-dashed border-white/12 bg-white/2 px-4 py-6 text-center text-white/40">
                No trade history yet.
              </div>
            ) : (
              history.map((entry) => (
                <div
                  key={entry.id}
                  className="rounded-xl border border-white/10 bg-white/3 p-3"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="text-sm text-white/85">{entry.message}</div>
                    <div className="text-[11px] text-white/40">
                      {new Date(entry.ts).toLocaleTimeString()}
                    </div>
                  </div>
                  <div className="mt-1 text-[11px] text-white/55">
                    {entry.kind.toUpperCase()}
                    {entry.itemName ? ` · ${entry.itemName}` : ""}
                    {entry.itemTier ? ` · ${entry.itemTier}` : ""}
                    {typeof entry.grossCredits === "number"
                      ? ` · ${entry.grossCredits} cr`
                      : ""}
                    {typeof entry.payoutCredits === "number"
                      ? ` · payout ${entry.payoutCredits} cr`
                      : ""}
                    {entry.counterpartName ? ` · ${entry.counterpartName}` : ""}
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </main>
  );
}

