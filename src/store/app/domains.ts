import { createAsyncThunk } from "@reduxjs/toolkit";
import { Domain } from "@/types";

export const fetchUserDomains = createAsyncThunk(
  "app/fetchUserDomains",
  async (_, thunkAPI) => {
    try {
      const response = await fetch("/api/domains");

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Failed to fetch domains:", errorData);
        return thunkAPI.rejectWithValue({
          title: "Failed to fetch domains",
          subtitle: errorData.message || "Unknown error",
        });
      }

      const domains = await response.json() as Domain[];
      return thunkAPI.fulfillWithValue(domains);
    } catch (error: any) {
      console.error("Error fetching domains:", error);
      return thunkAPI.rejectWithValue({
        title: "Something went wrong",
        subtitle: error.message,
      });
    }
  },
);

export const deleteDomain = createAsyncThunk(
  "app/deleteDomain",
  async (domainId: string, thunkAPI) => {
    try {
      const response = await fetch(`/api/domains/${domainId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Failed to delete domain:", errorData);
        return thunkAPI.rejectWithValue({
          title: "Failed to delete domain",
          subtitle: errorData.message || "Unknown error",
        });
      }

      // Return the deleted domain ID for the reducer to remove it from state
      return thunkAPI.fulfillWithValue(domainId);
    } catch (error: any) {
      console.error("Error deleting domain:", error);
      return thunkAPI.rejectWithValue({
        title: "Something went wrong",
        subtitle: error.message,
      });
    }
  },
);
