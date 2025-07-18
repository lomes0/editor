import { renderHook } from "@testing-library/react";
import { useResponsiveGrid } from "../useResponsiveGrid";

// Mock useMediaQuery hook
const mockUseMediaQuery = jest.fn();
jest.mock("@mui/material", () => ({
  ...jest.requireActual("@mui/material"),
  useMediaQuery: () => mockUseMediaQuery(),
}));

describe("useResponsiveGrid", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Breakpoint Detection", () => {
    it("should detect mobile breakpoint correctly", () => {
      mockUseMediaQuery
        .mockReturnValueOnce(true) // isMobile
        .mockReturnValueOnce(false) // isTablet
        .mockReturnValueOnce(false) // isDesktop
        .mockReturnValueOnce(false) // isWide
        .mockReturnValueOnce(false); // isTouch

      const { result } = renderHook(() => useResponsiveGrid({ itemCount: 10 }));

      expect(result.current.breakpoint).toBe("mobile");
      expect(result.current.columns).toBe(1);
    });

    it("should detect tablet breakpoint correctly", () => {
      mockUseMediaQuery
        .mockReturnValueOnce(false) // isMobile
        .mockReturnValueOnce(true) // isTablet
        .mockReturnValueOnce(false) // isDesktop
        .mockReturnValueOnce(false) // isWide
        .mockReturnValueOnce(true); // isTouch

      const { result } = renderHook(() => useResponsiveGrid({ itemCount: 10 }));

      expect(result.current.breakpoint).toBe("tablet");
      expect(result.current.columns).toBe(2);
    });

    it("should detect desktop breakpoint correctly", () => {
      mockUseMediaQuery
        .mockReturnValueOnce(false) // isMobile
        .mockReturnValueOnce(false) // isTablet
        .mockReturnValueOnce(true) // isDesktop
        .mockReturnValueOnce(false) // isWide
        .mockReturnValueOnce(false); // isTouch

      const { result } = renderHook(() => useResponsiveGrid({ itemCount: 10 }));

      expect(result.current.breakpoint).toBe("desktop");
      expect(result.current.columns).toBe(4);
    });

    it("should detect wide breakpoint correctly", () => {
      mockUseMediaQuery
        .mockReturnValueOnce(false) // isMobile
        .mockReturnValueOnce(false) // isTablet
        .mockReturnValueOnce(false) // isDesktop
        .mockReturnValueOnce(true) // isWide
        .mockReturnValueOnce(false); // isTouch

      const { result } = renderHook(() => useResponsiveGrid({ itemCount: 10 }));

      expect(result.current.breakpoint).toBe("wide");
      expect(result.current.columns).toBe(5);
    });
  });

  describe("Column Calculation", () => {
    it("should respect custom column override", () => {
      mockUseMediaQuery
        .mockReturnValueOnce(false) // isMobile
        .mockReturnValueOnce(false) // isTablet
        .mockReturnValueOnce(true) // isDesktop
        .mockReturnValueOnce(false) // isWide
        .mockReturnValueOnce(false); // isTouch

      const { result } = renderHook(() =>
        useResponsiveGrid({
          itemCount: 10,
          columnsOverride: 6,
        })
      );

      expect(result.current.columns).toBe(6);
    });

    it("should limit columns to item count when itemCount is less than default columns", () => {
      mockUseMediaQuery
        .mockReturnValueOnce(false) // isMobile
        .mockReturnValueOnce(false) // isTablet
        .mockReturnValueOnce(true) // isDesktop
        .mockReturnValueOnce(false) // isWide
        .mockReturnValueOnce(false); // isTouch

      const { result } = renderHook(() =>
        useResponsiveGrid({
          itemCount: 2, // Less than desktop default of 4
        })
      );

      expect(result.current.columns).toBe(2);
    });

    it("should not limit columns when limitToItemCount is false", () => {
      mockUseMediaQuery
        .mockReturnValueOnce(false) // isMobile
        .mockReturnValueOnce(false) // isTablet
        .mockReturnValueOnce(true) // isDesktop
        .mockReturnValueOnce(false) // isWide
        .mockReturnValueOnce(false); // isTouch

      const { result } = renderHook(() =>
        useResponsiveGrid({
          itemCount: 2,
          limitToItemCount: false,
        })
      );

      expect(result.current.columns).toBe(4); // Default desktop columns
    });
  });

  describe("Virtualization Threshold", () => {
    it("should enable virtualization when item count exceeds threshold", () => {
      mockUseMediaQuery.mockReturnValue(false);

      const { result } = renderHook(() =>
        useResponsiveGrid({
          itemCount: 50,
          virtualizationThreshold: 20,
        })
      );

      expect(result.current.shouldVirtualize).toBe(true);
    });

    it("should disable virtualization when item count is below threshold", () => {
      mockUseMediaQuery.mockReturnValue(false);

      const { result } = renderHook(() =>
        useResponsiveGrid({
          itemCount: 10,
          virtualizationThreshold: 20,
        })
      );

      expect(result.current.shouldVirtualize).toBe(false);
    });

    it("should disable virtualization on touch devices even when threshold is exceeded", () => {
      mockUseMediaQuery
        .mockReturnValueOnce(false) // isMobile
        .mockReturnValueOnce(false) // isTablet
        .mockReturnValueOnce(true) // isDesktop
        .mockReturnValueOnce(false) // isWide
        .mockReturnValueOnce(true); // isTouch

      const { result } = renderHook(() =>
        useResponsiveGrid({
          itemCount: 50,
          virtualizationThreshold: 20,
        })
      );

      expect(result.current.shouldVirtualize).toBe(false);
    });
  });

  describe("Device Capabilities", () => {
    it("should detect touch device correctly", () => {
      mockUseMediaQuery
        .mockReturnValueOnce(false) // isMobile
        .mockReturnValueOnce(true) // isTablet
        .mockReturnValueOnce(false) // isDesktop
        .mockReturnValueOnce(false) // isWide
        .mockReturnValueOnce(true); // isTouch

      const { result } = renderHook(() => useResponsiveGrid({ itemCount: 10 }));

      expect(result.current.isTouch).toBe(true);
    });

    it("should detect non-touch device correctly", () => {
      mockUseMediaQuery
        .mockReturnValueOnce(false) // isMobile
        .mockReturnValueOnce(false) // isTablet
        .mockReturnValueOnce(true) // isDesktop
        .mockReturnValueOnce(false) // isWide
        .mockReturnValueOnce(false); // isTouch

      const { result } = renderHook(() => useResponsiveGrid({ itemCount: 10 }));

      expect(result.current.isTouch).toBe(false);
    });
  });

  describe("Performance Considerations", () => {
    it("should return consistent results for same inputs", () => {
      mockUseMediaQuery.mockReturnValue(false);

      const { result, rerender } = renderHook(() =>
        useResponsiveGrid({ itemCount: 10 })
      );

      const firstResult = result.current;
      rerender();
      const secondResult = result.current;

      expect(firstResult).toEqual(secondResult);
    });

    it("should handle zero item count gracefully", () => {
      mockUseMediaQuery.mockReturnValue(false);

      const { result } = renderHook(() => useResponsiveGrid({ itemCount: 0 }));

      expect(result.current.columns).toBeGreaterThan(0);
      expect(result.current.shouldVirtualize).toBe(false);
    });

    it("should handle negative item count gracefully", () => {
      mockUseMediaQuery.mockReturnValue(false);

      const { result } = renderHook(() => useResponsiveGrid({ itemCount: -5 }));

      expect(result.current.columns).toBeGreaterThan(0);
      expect(result.current.shouldVirtualize).toBe(false);
    });
  });
});
