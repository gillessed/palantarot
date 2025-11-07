import { Burger, Container, Group, Image, Menu, Title } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import classNames from "classnames";
import { memo, useCallback } from "react";
import { Link, Outlet, useNavigate } from "react-router";
import classes from "./AppContainer.module.css";
import { IconPencil } from "@tabler/icons-react";
import { StaticRoutes } from "../../../shared/routes";

export const AppContainer = memo(function AppContainer() {
  const navigate = useNavigate();
  const handleEnterScore = useCallback(() => {
    navigate(StaticRoutes.enter());
  }, [navigate]);
  const [opened, { toggle, close }] = useDisclosure(false);
  return (
    <div>
      <header className={classes.header}>
        <Container size="md">
          <div className={classes.inner}>
            <Link to={StaticRoutes.home()} className={classNames(classes.link, "appLink")}>
              <Image src="/images/joker.png" w="20" h="30" ml="sm" mr="sm" />
              <Title order={4}>Palantarot</Title>
            </Link>
            <Group visibleFrom="sm">
              <Link className="appLink" to={StaticRoutes.enter()}>
                Enter Score
              </Link>
              <Link className="appLink" to={StaticRoutes.results()}>
                Results
              </Link>
              <Link className="appLink" to={StaticRoutes.recent()}>
                Recent Games
              </Link>
            </Group>
            <Menu onClose={close}>
              <Menu.Target>
                <Burger opened={opened} onClick={toggle} size="sm" hiddenFrom="sm" />
              </Menu.Target>
              <Menu.Dropdown>
                <Menu.Item leftSection={<IconPencil />} onClick={handleEnterScore}>
                  Enter score
                </Menu.Item>
              </Menu.Dropdown>
            </Menu>
          </div>
        </Container>
      </header>
      <Outlet />
    </div>
  );
});
