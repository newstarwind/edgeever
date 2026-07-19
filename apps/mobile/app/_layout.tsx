import "react-native-gesture-handler";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { ShareManager } from "../src/components/ShareManager";
import { SessionProvider } from "../src/lib/session";

export default function RootLayout() {
	const [queryClient] = useState(() => new QueryClient());

	return (
		<GestureHandlerRootView style={{ flex: 1 }}>
			<SafeAreaProvider>
				<QueryClientProvider client={queryClient}>
					<SessionProvider>
						<Stack screenOptions={{ headerShown: false }} />
						<ShareManager />
						<StatusBar style="dark" />
					</SessionProvider>
				</QueryClientProvider>
			</SafeAreaProvider>
		</GestureHandlerRootView>
	);
}
