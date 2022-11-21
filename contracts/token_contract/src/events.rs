//! This is the standard for nep-141 events
//!
//! The events will be picked up by the NEAR indexer
//!
//! [`FtMint`], [`FtTransfer`], [`FtBurn`]

use near_sdk::json_types::U128;
use near_sdk::serde::Serialize;
use near_sdk::AccountId;

use near_sdk::env;

#[derive(Serialize, Debug)]
#[serde(tag = "standard")]
#[must_use = "don't forget to `.emit()` this event"]
#[serde(rename_all = "snake_case")]

pub(crate) enum NearEvent<'a> {
    Nep141(Nep141Event<'a>),
}

impl<'a> NearEvent<'a> {
    fn to_json_string(&self) -> String {
        // Events cannot fail to serialize so fine to panic on error
        #[allow(clippy::redundant_closure)]
        serde_json::to_string(self)
            .ok()
            .unwrap_or_else(|| env::abort())
    }

    fn to_json_event_string(&self) -> String {
        format!("EVENT_JSON:{}", self.to_json_string())
    }

    /// Logs the event to the host.
    /// Ensures that the event is triggered and to consume the event.
    pub(crate) fn emit(self) {
        near_sdk::env::log_str(&self.to_json_event_string())
    }
}

/// Data to log for an FT min event.
/// To log this event, call [`.emit()`](FtMint::emit)
#[must_use]
#[derive(Serialize, Debug, Clone)]
pub struct FtMint<'a> {
    pub owner_id: &'a AccountId,
    pub amount: &'a U128,

    #[serde(skip_serializing_if = "Option::is_none")]
    pub memo: Option<&'a str>,
}

impl FtMint<'_> {
    /// log the event to the host
    /// Required to ensure that the event is triggered and to cosume the event
    pub fn emit(self) {
        Self::emit_many(&[self])
    }

    /// Emit an FT mint event. Each [`FtMint`] represents the data of each mint
    pub fn emit_many(data: &[FtMint<'_>]) {
        new_141_v1(Nep141EventKind::FtMint(data)).emit()
    }
}

/// Data to log for a FT transfer event.
/// call `.emit()`(FtTransfer::event) to log
#[must_use]
#[derive(Serialize, Debug, Clone)]
pub struct FtTransfer<'a> {
    pub old_owner_id: &'a AccountId,
    pub new_owner_id: &'a AccountId,
    pub amount: &'a U128,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub memo: Option<&'a str>,
}

impl FtTransfer<'_> {
    /// Logs the event to the host.
    /// Ensures that the event is triggered and to consume the event
    pub fn emit(self) {
        Self::emit_many(&[self])
    }

    /// Emits an Ft transfer event
    /// Each FtTransfer represents the data of each transfer
    pub fn emit_many(data: &[FtTransfer<'_>]) {
        new_141_v1(Nep141EventKind::FtTransfer(data)).emit()
    }
}

#[derive(Serialize, Debug)]
pub(crate) struct Nep141Event<'a> {
    version: &'static str,

    #[serde(flatten)]
    event_kind: Nep141EventKind<'a>,
}

#[derive(Serialize, Debug)]
#[serde(tag = "event", content = "data")]
#[serde(rename_all = "snake_case")]
#[allow(clippy::enum_variant_names)]
enum Nep141EventKind<'a> {
    FtMint(&'a [FtMint<'a>]),
    FtTransfer(&'a [FtTransfer<'a>]),
}

fn new_141<'a>(version: &'static str, event_kind: Nep141EventKind<'a>) -> NearEvent<'a> {
    NearEvent::Nep141(Nep141Event {
        version,
        event_kind,
    })
}

fn new_141_v1(event_kind: Nep141EventKind) -> NearEvent {
    new_141("1.0.0", event_kind)
}
