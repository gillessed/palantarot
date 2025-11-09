import { Affix, Group, Image, Space, Stack, Text } from "@mantine/core";
import {
  IconGlass,
  IconHelp,
  IconHistory,
  IconList,
  IconPencil,
  IconPlayCard,
  IconRobot,
  IconSearch,
  IconStar,
  IconUser,
} from "@tabler/icons-react";
import { memo } from "react";
import { DynamicRoutes, StaticRoutes } from "../../../shared/routes";
import { NavigationButton } from "../../components/NavigationButton";
import { PageContainer } from "../PageContainer";

export const HomeContainer = memo(function HomeContainer() {
  return (
    <PageContainer>
      <Stack align="center" flex={1} mt={60}>
        <Text fs="italic" size="lg">Where all the points are fake</Text>
        <Space h="xl" />
        <Stack gap="xs">
          <NavigationButton
            to={StaticRoutes.lobby()}
            icon={<IconPlayCard />}
            color="cyan"
            title="Play Online"
          />
          <NavigationButton
            to={StaticRoutes.enter()}
            icon={<IconPencil />}
            color="green"
            title="Enter Score"
          />
          <NavigationButton
            to={DynamicRoutes.results()}
            icon={<IconHistory />}
            color="blue"
            title="Results"
          />
          <NavigationButton
            to={StaticRoutes.recent()}
            icon={<IconList />}
            color="blue"
            title="Recent Games"
          />
          <NavigationButton
            to={StaticRoutes.search()}
            icon={<IconSearch />}
            color="blue"
            title="Advanced Search"
          />
          <NavigationButton
            to={StaticRoutes.records()}
            icon={<IconGlass />}
            color="blue"
            title="Records"
          />
          <NavigationButton
            to={StaticRoutes.addPlayer()}
            icon={<IconUser />}
            color="blue"
            title="Add New Player"
          />
          <NavigationButton
            to={StaticRoutes.bots()}
            icon={<IconRobot />}
            color="blue"
            title="Bots"
          />
          <NavigationButton
            to={StaticRoutes.tarothons()}
            icon={<IconStar />}
            color="blue"
            title="Tarothon"
          />
          <NavigationButton
            to={StaticRoutes.rules()}
            icon={<IconHelp />}
            color="grape"
            title="Help"
          />
        </Stack>
        <Affix>
          <Group gap={0} mr={20} mb={10}>
            <span className="callout-text">Contribute on </span>
            <Image
              src="/images/GitHub-Mark-32px.png"
              w={20}
              h={20}
              mr={3}
              ml={3}
            />
            <a href="https://github.com/gillessed/palantarot">Github</a>
          </Group>
        </Affix>
      </Stack>
    </PageContainer>
  );
});
