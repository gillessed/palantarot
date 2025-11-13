import { Button, Space, Stack, Text, TextInput, Title } from "@mantine/core";
import { IconLogin } from "@tabler/icons-react";
import React, { memo, useCallback, useState } from "react";
import { useLogin } from "../../services/apis/useLogin";
import { isAsyncError, isAsyncLoading } from "../../utils/Async";
import { useNavigate } from "react-router";
import { StaticRoutes } from "../../../shared/routes";

export const LoginContainer = memo(function LoginContainer() {
  const [password, setPassword] = useState("");

  const handlePasswordChange = useCallback(
    (event: React.FormEvent<HTMLInputElement>) => {
      setPassword(event.currentTarget.value);
    },
    []
  );

  const navigate = useNavigate();
  const handleLoginSuccessful = useCallback(() => {
    navigate(StaticRoutes.home());
  }, [navigate]);
  const { state: loginState, request: login } = useLogin(handleLoginSuccessful);
  const loading = isAsyncLoading(loginState);
  const error = isAsyncError(loginState) ? loginState.error.message : undefined;

  const handleLoginClicked = useCallback(() => {
    if (password.length > 0 && !loading) {
      login({ secret: password });
    }
  }, [password, login]);

  return (
    <Stack align="center" bg="#12264f" h="100vh">
      <Stack align="center" justify="center" gap={0} h="50vh">
        <Title c="gray.2" order={1} fz="72px">
          Palantarot
        </Title>
        <Text c="gray.4" fs="italic" pos="relative" bottom={20}>
          If you don't know the password, ask a tarot player.
        </Text>
      </Stack>
      <Space />
      <TextInput
        ref={(input) => input?.focus()}
        type="password"
        placeholder="What is the password?"
        value={password}
        onChange={handlePasswordChange}
        error={error}
        w={300}
      />
      <Button
        type="submit"
        loading={loading}
        leftSection={<IconLogin />}
        disabled={password.length === 0}
        color="blue"
        w={300}
        onClick={handleLoginClicked}
      >
        Login
      </Button>
    </Stack>
  );
});
