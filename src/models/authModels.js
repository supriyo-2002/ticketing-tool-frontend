
 // src/models/authModels.js

// ================================
// LOGIN MODEL
// ================================

export const createLoginRequest = (email, password) => ({
  email: email.trim(),
  password,
});

export const normalizeLoginResponse = (response) => {
  if (
    response?.success !== true ||
    !response?.data?.user ||
    !response?.data?.session?.access_token
  ) {
    throw new Error(
      response?.message || "Invalid login response from server."
    );
  }

  const { user, session } = response.data;

  return {
    success: response.success,
    message: response.message,
    user: {
      user_id: user.user_id,
      organization_id: user.organization_id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
    session: {
      access_token: session.access_token,
      token_type: session.token_type,
      expires_in: session.expires_in,
      expires_at: session.expires_at,
      refresh_token: session.refresh_token,
    },
  };
};

// ================================
// ORGANIZATION REGISTRATION MODEL
// ================================

export const createRegistrationRequest = ({
  name,
  email,
  password,
  organizationName,
}) => {
  const payload = {
    name: name?.trim() || "",
    email: email?.trim() || "",
    password: password || "",
    organizationName: organizationName?.trim() || "",
  };

  if (!payload.name) {
    throw new Error("Please enter your full name.");
  }

  if (!payload.email) {
    throw new Error("Please enter your email address.");
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.email)) {
    throw new Error("Please enter a valid email address.");
  }

  if (!payload.password) {
    throw new Error("Please enter your password.");
  }

  if (payload.password.length < 8) {
    throw new Error("Password must contain at least 8 characters.");
  }

  if (!payload.organizationName) {
    throw new Error("Please enter your organization name.");
  }

  return payload;
};

export const normalizeRegistrationResponse = (response) => {
  if (
    response?.success !== true ||
    !response?.data?.user ||
    !response?.data?.organization
  ) {
    throw new Error(
      response?.message || "Invalid registration response from server."
    );
  }

  const { user, organization, emailConfirmationRequired } =
    response.data;

  return {
    success: true,
    message:
      response.message ||
      "Registration successful. Please check your email and confirm your account before logging in.",
    user: {
      user_id: user.user_id,
      organization_id: user.organization_id,
      name: user.name,
      email: user.email,
      role: user.role,
      created_at: user.created_at,
    },
    organization: {
      organization_id: organization.organization_id,
      name: organization.name,
      created_at: organization.created_at,
    },
    emailConfirmationRequired: emailConfirmationRequired === true,
  };
};
