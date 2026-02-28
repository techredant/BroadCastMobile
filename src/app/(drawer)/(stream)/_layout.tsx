import { useAuth } from "@clerk/clerk-expo";
import { Redirect } from "expo-router";
import { NativeTabs } from "expo-router/unstable-native-tabs";

const TabsLayout = () => {
  // const { isSignedIn, isLoaded } = useAuth();

  // if (!isLoaded) return null;

  // if (!isSignedIn) {
  //   return <Redirect href={"/(auth)"} />;
  // }

  return (
    <NativeTabs>
      <NativeTabs.Trigger name="index">
        <NativeTabs.Trigger.Label>Chats</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="message" md="chat" selectedColor={"#6C5CE7"} />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="explore">
        <NativeTabs.Trigger.Label>Explore</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="safari" md="explore" selectedColor={"#6C5CE7"} />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="profile">
        <NativeTabs.Trigger.Label>Profile</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="person.fill"  md="person" selectedColor={"#6C5CE7"} />
      </NativeTabs.Trigger>
    </NativeTabs>
  );
};

export default TabsLayout;
