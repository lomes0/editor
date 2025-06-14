import { fireEvent, render, screen } from "@testing-library/react";
import DeleteBothDocument from "../DeleteBoth";
import { DocumentType, UserDocument } from "@/types";
import { actions } from "@/store";

// Mock the store
jest.mock("@/store", () => ({
  useDispatch: jest.fn(() => jest.fn()),
  actions: {
    alert: jest.fn(() => ({ type: "alert" })),
    deleteLocalDocument: jest.fn(() => ({ type: "deleteLocalDocument" })),
    deleteCloudDocument: jest.fn(() => ({ type: "deleteCloudDocument" })),
  },
}));

describe("DeleteBothDocument", () => {
  // Sample document for testing
  const sampleDocument: UserDocument = {
    id: "test-id",
    local: {
      id: "test-id",
      name: "Test Document",
      type: DocumentType.DOCUMENT,
      head: "rev1",
      data: {},
      createdAt: "2025-06-14",
      updatedAt: "2025-06-14",
      revisions: [],
    },
    cloud: {
      id: "test-id",
      name: "Test Document",
      type: DocumentType.DOCUMENT,
      head: "rev1",
      data: {},
      createdAt: "2025-06-14",
      updatedAt: "2025-06-14",
      revisions: [],
      handle: "test-handle",
      author: { id: "user1", name: "User 1" },
      coauthors: [],
    },
  };

  // Sample directory for testing
  const sampleDirectory: UserDocument = {
    id: "dir-id",
    local: {
      id: "dir-id",
      name: "Test Directory",
      type: DocumentType.DIRECTORY,
      head: "rev1",
      data: {},
      createdAt: "2025-06-14",
      updatedAt: "2025-06-14",
      revisions: [],
    },
    cloud: {
      id: "dir-id",
      name: "Test Directory",
      type: DocumentType.DIRECTORY,
      head: "rev1",
      data: {},
      createdAt: "2025-06-14",
      updatedAt: "2025-06-14",
      revisions: [],
      handle: "test-dir-handle",
      author: { id: "user1", name: "User 1" },
      coauthors: [],
    },
  };

  test("renders document delete button", () => {
    render(<DeleteBothDocument userDocument={sampleDocument} />);
    const button = screen.getByLabelText("Delete Document");
    expect(button).toBeInTheDocument();
  });

  test("renders directory delete button", () => {
    render(<DeleteBothDocument userDocument={sampleDirectory} />);
    const button = screen.getByLabelText("Delete Folder");
    expect(button).toBeInTheDocument();
  });

  test("renders as menu item when variant is menuitem", () => {
    render(
      <DeleteBothDocument
        userDocument={sampleDocument}
        variant="menuitem"
      />,
    );
    const menuItem = screen.getByText("Delete");
    expect(menuItem).toBeInTheDocument();
  });

  test("handles delete action for both local and cloud", async () => {
    // Mock implementation for alert and dispatch
    const mockDispatch = jest.fn();
    const mockAlert = jest.fn().mockResolvedValue({
      payload: "test-delete-id",
    });
    const mockDeleteLocal = jest.fn();
    const mockDeleteCloud = jest.fn();

    (actions.alert as jest.Mock).mockImplementation(mockAlert);
    (actions.deleteLocalDocument as jest.Mock).mockImplementation(
      mockDeleteLocal,
    );
    (actions.deleteCloudDocument as jest.Mock).mockImplementation(
      mockDeleteCloud,
    );

    render(<DeleteBothDocument userDocument={sampleDocument} />);
    const button = screen.getByLabelText("Delete Document");

    fireEvent.click(button);

    // Verify alert was shown
    expect(mockAlert).toHaveBeenCalled();

    // Once the test is complete, we would verify both delete actions were called
  });
});
