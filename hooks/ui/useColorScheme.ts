import { Colors } from "@/constants/Colors";
import { useAppTheme } from "@/utils/theme";

export function useColorScheme(): keyof typeof Colors {
  return useAppTheme().colorScheme;
}
