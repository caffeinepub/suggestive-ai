import Map "mo:core/Map";
import Principal "mo:core/Principal";
import Iter "mo:core/Iter";
import Runtime "mo:core/Runtime";
import OutCall "http-outcalls/outcall";

actor {
  let keys = Map.empty<Principal, Text>();

  public shared ({ caller }) func storeKey(key : Text) : async () {
    let principal = caller;
    keys.add(principal, key);
  };

  public shared ({ caller }) func removeKey() : async () {
    let principal = caller;
    if (not keys.containsKey(principal)) { Runtime.trap("Key does not exist") };
    keys.remove(principal);
  };

  public shared ({ caller }) func getKey() : async Text {
    let principal = caller;
    switch (keys.get(principal)) {
      case (null) { Runtime.trap("Key does not exist") };
      case (?key) { key };
    };
  };

  public query ({ caller }) func transform(input : OutCall.TransformationInput) : async OutCall.TransformationOutput {
    OutCall.transform(input);
  };

  public shared ({ caller }) func getAllKeys() : async [Text] {
    keys.values().toArray();
  };
};
