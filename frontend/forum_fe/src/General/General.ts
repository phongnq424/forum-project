// General.ts

// Định nghĩa AppError ngay trong file
export class AppError extends Error {
  public status: number;

  constructor(message: string, status = -1) {
    super(message);
    this.status = status;

    Object.setPrototypeOf(this, AppError.prototype);
  }
}

// Kiểu cho menu options
interface MenuOption {
  id: number;
  name: string;
}

// Kiểu cho gender
interface GenderOption {
  id: string;
  gender: string;
}

const General = {
  constValue: {
    dateTimeFormat: "dd/MMM/yyyy",
  },

  createError(error: any): AppError {
    const message =
      error.data?.error ||
      error.data?.message ||
      `FE Error! Detail is that ${error.message}`;
    return new AppError(message, error.status ?? -1);
  },

  stringError(error: AppError | Error): string {
    return `Status: ${(error as AppError).status ?? -1}; Message: ${
      error.message
    }`;
  },

  reactionType: {
    LOVE: "LOVE" as const,
  },

  menuOptions: {
    SEE_PROFILE: { id: 0, name: "See Profile" } as MenuOption,
    EDIT_PROFILE: { id: 1, name: "Edit Profile" } as MenuOption,
    LOG_OUT: { id: 2, name: "Log Out" } as MenuOption,
    CHANGE_PASSWORD: { id: 3, name: "Change Password" } as MenuOption,

    asArray(): MenuOption[] {
      return Object.values(this).filter(
        (item) => typeof item !== "function"
      ) as MenuOption[];
    },
  },

  optionOfCreateProfilePage: {
    CREATE: "Create" as const,
    UPDATE: "Update" as const,
  },

  genders: {
    MALE: { id: "MALE", gender: "Male" } as GenderOption,
    FEMALE: { id: "FEMALE", gender: "Female" } as GenderOption,
    OTHER: { id: "OTHER", gender: "Other" } as GenderOption,

    asArray(): GenderOption[] {
      return Object.values(this).filter(
        (item) => typeof item !== "function"
      ) as GenderOption[];
    },
  },

  typesConversation: {
    CHATS: { name: "Chats" },
    GROUPS: { name: "Groups" },
    asArray: function (): { name: string }[] {
      return Object.values(this).filter((i) => typeof i !== "function");
    },
  },

  showFor: {
    ALL: "all" as const,
    OWN: "own" as const,
    VIEWER: "viewer" as const,
  },

  accountRoles: {
    ADMIN: "ADMIN",
    USER: "USER",
  },
};

export default General;
