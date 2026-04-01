import { createAppSlice } from "@/redux/createAppSlice";
import type { Locale } from "@/types/i18n";
import { PayloadAction } from "@reduxjs/toolkit";

export interface TranslationState {
  locale: Locale;
}

const initialState: TranslationState = {
  locale: "en",
};

export const translation = createAppSlice({
  name: "translation",
  initialState,
  reducers: {
    setTranslations: (
      state,
      action: PayloadAction<{
        locale: Locale;
      }>,
    ) => {
      state.locale = action.payload.locale;
    },
  },
});

export const { setTranslations } = translation.actions;
export default translation.reducer;
