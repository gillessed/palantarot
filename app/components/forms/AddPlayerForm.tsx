import { Button, Fieldset, Select, Stack } from "@mantine/core";
import { IconCirclePlus } from "@tabler/icons-react";
import { memo, useCallback, useMemo, useState } from "react";
import { NewPlayer } from "../../../server/model/Player";
import { RandomBotType } from "../../../shared/bots/RandomBot";
import { DefaultTarotBotRegistry } from "../../../shared/bots/TarotBot";
import { TextInput } from "./Elements";

interface Props {
  loading?: boolean;
  isBot?: boolean;
  onSubmit: (newPlayer: NewPlayer) => void;
}

const fieldValidator = (emptyMessage: string) => {
  return (value: string) => {
    if (value.length < 1) {
      return emptyMessage;
    } else if (value.length > 30) {
      return "Field exceeds character limit.";
    } else {
      return undefined;
    }
  };
};

export const AddPlayerForm = memo(function AddPlayerForm({ onSubmit, isBot, loading }: Props) {
  const firstNameValidator = useMemo(() => fieldValidator("Please enter a first name."), []);
  const lastNameValidator = useMemo(() => fieldValidator("Please enter a last name."), []);
  const [firstName, setFirstName] = useState("");
  const [firstNameError, setFirstNameError] = useState<string | undefined>();
  const [lastName, setLastName] = useState("");
  const [lastNameError, setLastNameError] = useState<string | undefined>();
  const [botType, setBotType] = useState(RandomBotType);

  const handleFirstNameChange = useCallback(
    (value: string, error?: string) => {
      setFirstName(value);
      setFirstNameError(error);
    },
    [setFirstName, setFirstNameError]
  );

  const handleLastNameChange = useCallback(
    (value: string, error?: string) => {
      setLastName(value);
      setLastNameError(error);
    },
    [setLastName, setLastNameError]
  );

  const submitEnabled = firstNameError == null && lastNameError == null;

  const handleSubmit = useCallback(() => {
    if (submitEnabled) {
      onSubmit({ firstName, lastName, botType, isBot });
    }
  }, [submitEnabled, onSubmit, isBot, firstName, lastName, botType]);

  const botTypes = Array.from(Object.keys(DefaultTarotBotRegistry));
  const handleBotTypeChanges = useCallback(
    (newBotType: string | null) => {
      if (newBotType != null) {
        setBotType(newBotType);
      }
    },
    [setBotType]
  );

  return (
    <Stack align="center">
      <TextInput label="First Name: " onChange={handleFirstNameChange} validator={firstNameValidator} />
      <TextInput label="Last Name: " onChange={handleLastNameChange} validator={lastNameValidator} />

      {isBot && (
        <Fieldset legend="Bot Type">
          <Select data={botTypes} value={botType} onChange={handleBotTypeChanges} />
        </Fieldset>
      )}

      <div className="add-player-button-container">
        <Button loading={loading} rightSection={<IconCirclePlus />} onClick={handleSubmit} disabled={!submitEnabled} color="green">
          Add Player
        </Button>
      </div>
    </Stack>
  );
});
