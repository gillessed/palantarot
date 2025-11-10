import { ActionIcon, Group, Stack, Title } from "@mantine/core";
import { IconChevronLeft, IconChevronRight } from "@tabler/icons-react";
import moment from "moment";
import { memo, useCallback, useMemo } from "react";
import { useNavigate, useParams } from "react-router";
import { IMonth, Month } from "../../../server/model/Month";
import { DynamicRoutes } from "../../../shared/routes";
import { AsyncView } from "../../components/asyncView/AsyncView";
import { PlayersLoader } from "../../services/PlayersLoader";
import { ResultsLoader } from "../../services/ResultsLoader";
import { PageContainer } from "../PageContainer";
import { ResultsView } from "./ResultsView";
import { GamesForMonthLoader } from "../../services/GamesForMonthLoader";
import { MonthPicker } from "../../components/MonthPicker";

const Loaders = {
  results: ResultsLoader,
  players: PlayersLoader,
  games: GamesForMonthLoader,
};
type LoaderType = typeof Loaders;

function parseNumberString(str: string | undefined): number | undefined {
  if (str == null) {
    return undefined;
  }
  const num = Number(str);
  if (isNaN(num)) {
    return undefined;
  }
  return Math.floor(num);
}

function useParamsMonth() {
  const { month: monthParamString, year: yearParamString } = useParams();
  return useMemo(() => {
    const monthParam = parseNumberString(monthParamString);
    const yearParam = parseNumberString(yearParamString);
    if (monthParam == null || yearParam == null) {
      return undefined;
    }
    if (monthParam < 1 || monthParam > 12) {
      return undefined;
    }
    if (yearParam < 0 || yearParam > moment().year()) {
      return undefined;
    }
    const month = IMonth.n(monthParam - 1, yearParam);
    const now = IMonth.now();
    if (IMonth.compare(now, month) < 0) {
      return undefined;
    }
    return month;
  }, [monthParamString, yearParamString]);
}

export const ResultsContainer = memo(function ResultsContainer() {
  const navigate = useNavigate();
  const monthParam = useParamsMonth();
  const goToMonth = useCallback(
    ({ month: m, year: y }: Month) => {
      navigate(DynamicRoutes.results(`${y}`, `${m + 1}`));
    },
    [navigate]
  );

  const month = IMonth.n(
    monthParam?.month ?? moment().month(),
    monthParam?.year ?? moment().year()
  );
  const args = useMemo(
    () => ({ results: month, games: month, players: undefined }),
    [month]
  );

  return (
    <PageContainer>
      <Stack align="stretch" pt={40}>
        <MonthPicker month={month} onChanged={goToMonth} />
        <AsyncView<LoaderType, { month: Month }>
          loaders={Loaders}
          args={args}
          Component={ResultsView}
          additionalArgs={{ month }}
        />
      </Stack>
    </PageContainer>
  );
});
