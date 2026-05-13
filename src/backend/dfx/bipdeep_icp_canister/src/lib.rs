// Import necessary libraries
use ic_cdk::{api, export};
use ic_cdk_macros::{init, post_upgrade, pre_upgrade, update};
use ic_cdk::export::candid::{Nat, Nat64};
// Define BipDeep canister structure
struct BipDeepCanister {
    // Initialize variable to store time
    creation_time: Nat64,
}
// Implement methods for BipDeepCanister
impl BipDeepCanister {
    // Initialize canister
    fn new() -> Self {
        BipDeepCanister {
            creation_time: api::time(),
        }
    }
    // Greet method
    fn greet(&self, name: String) -> String {
        format!("Hello, {}! From BipDeep ICP canister created at {}", name, self.creation_time)
    }
}
// Define init method to initialize canister
#[init]
fn init() -> BipDeepCanister {
    BipDeepCanister::new()
}
// Define greet method to handle greet call
#[update]
fn greet(name: String) -> String {
    let canister = init();
    canister.greet(name)
}
