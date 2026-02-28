import {
  View,
  Text,
  Pressable,
  ActivityIndicator,
  StatusBar,
} from "react-native";
import React, { useMemo, useState } from "react";
import { Picker } from "@react-native-picker/picker";
import { SafeAreaView } from "react-native-safe-area-context";
import TypeWriter from "react-native-typewriter";
import { useUser } from "@clerk/clerk-expo";
import axios from "axios";
import { router } from "expo-router";
import iebc from "../../../assets/data/iebc.json";
import { useTheme } from "../../../context/ThemeContext";


export default function LocationSelection() {
  const { theme, isDark } = useTheme();
  const { user, isLoaded } = useUser();

  const [selectedCounty, setSelectedCounty] = useState("");
  const [selectedConstituency, setSelectedConstituency] = useState("");
  const [selectedWard, setSelectedWard] = useState("");
  const [loading, setLoading] = useState(false);

  // IEBC cascading data
  const constituencies = useMemo(() => {
    const county = iebc.counties.find((c) => c.name === selectedCounty);
    return county?.constituencies || [];
  }, [selectedCounty]);

  const wards = useMemo(() => {
    const constituency = constituencies.find(
      (c) => c.name === selectedConstituency
    );
    return constituency?.wards || [];
  }, [selectedConstituency, constituencies]);

  // Save location to backend
  const saveLocation = async () => {
  if (loading) return;
  if (!user?.id) {
    console.log("User not ready");
    return;
  }

  setLoading(true);

  try {
    const payload = {
      clerkId: user.id,
      county: selectedCounty || "N/A",
      constituency: selectedConstituency || "N/A",
      ward: selectedWard || "N/A",
    };

    console.log("Sending payload:", payload);

    await axios.post(
      "https://cast-api-zeta.vercel.app/api/users/update-location",
      payload
    );

    console.log("Location saved");
    await user?.update({
  unsafeMetadata: {
    ...user?.unsafeMetadata,
    onboardingComplete: true,
  },
});

    // Router navigation
    try {
     router.replace("/(drawer)/(tabs)");

    } catch (navErr) {
      console.log("Navigation failed:", navErr);
    }
  } catch (err: any) {

    console.log("❌ Save failed:", err?.message || err);
  } finally {
    setLoading(false);
  }

};


  // if (!isLoaded) return null;

  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: theme.background,
        justifyContent: "center",
        paddingHorizontal: 20,
      }}
    >
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle={isDark ? "light-content" : "dark-content"}
      />

      <View style={{ height: 120 }}>
        <TypeWriter
          typing={1}
          numberOfLines={2}
          style={{
            margin: 20,
            fontSize: 20,
            fontWeight: "bold",
            textAlign: "center",
            color: theme.text,
          }}
        >
          Welcome to BroadCast, In pursuit of a perfect nation.
        </TypeWriter>
      </View>

      {/* County */}
      <Text style={{ fontWeight: "bold", fontSize: 20, color: theme.text }}>County</Text>
      <Picker
        selectedValue={selectedCounty}
        onValueChange={(val) => {
          setSelectedCounty(val);
          setSelectedConstituency("");
          setSelectedWard("");
        }}
        style={{ color: theme.text }}
        dropdownIconColor={theme.subtext}
      >
        <Picker.Item label="Select County" value="" />
        {iebc.counties.map((c, idx) => (
          <Picker.Item key={idx} label={c.name} value={c.name} />
        ))}
      </Picker>

      {/* Constituency + Ward */}
      {selectedCounty && (
        <>
          <Text style={{ fontWeight: "bold", fontSize: 20, color: theme.text }}>Constituency</Text>
          <Picker
            selectedValue={selectedConstituency}
            onValueChange={(val) => {
              setSelectedConstituency(val);
              setSelectedWard("");
            }}
            style={{ color: theme.text }}
            dropdownIconColor={theme.subtext}
          >
            <Picker.Item label="Select Constituency" value="" />
            {constituencies.map((c, idx) => (
              <Picker.Item key={idx} label={c.name} value={c.name} />
            ))}
          </Picker>

          {selectedConstituency && (
            <>
              <Text style={{ fontWeight: "bold", fontSize: 20, color: theme.text }}>Ward</Text>
              <Picker
                selectedValue={selectedWard}
                onValueChange={setSelectedWard}
                style={{ color: theme.text }}
                dropdownIconColor={theme.subtext}
              >
                <Picker.Item label="Select Ward" value="" />
                {wards.map((w, idx) => (
                  <Picker.Item key={idx} label={w.name} value={w.name} />
                ))}
              </Picker>
            </>
          )}
        </>
      )}

      {/* Selection preview */}
      <Text style={{ marginTop: 20, fontWeight: "bold", color: theme.subtext }}>
        ✅ Selected: {selectedCounty}
        {selectedConstituency && ` → ${selectedConstituency}`}
        {selectedWard && ` → ${selectedWard}`}
      </Text>

      {/* Continue */}
      {selectedCounty &&
        selectedConstituency &&
        selectedWard && (
          <Pressable
            onPress={saveLocation}
            style={{
              backgroundColor: theme.primary,
              paddingVertical: 16,
              borderRadius: 12,
              flexDirection: "row",
              justifyContent: "center",
              alignItems: "center",
              marginTop: 40,
            }}
          >
                    <Text style={{ color: "#fff", fontWeight: "bold" }}> {loading ? "loading..." : "Save & Continue"}</Text>
        
          </Pressable>
        )}
    </SafeAreaView>
  );
}