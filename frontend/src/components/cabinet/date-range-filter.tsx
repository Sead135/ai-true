"use client";

import { DateField, DateRangePicker, Label, RangeCalendar } from "@heroui/react";
import { parseDate } from "@internationalized/date";
import { useLayoutEffect, useRef, useState } from "react";
import { utcToday } from "@/lib/dates";
import { findDialogPortal } from "@/lib/modal-portal";
import { useIsMobile } from "@/lib/use-is-mobile";
import { IconCalendar } from "./filter-icons";

type Props = {
  from: string;
  to: string;
  onChange: (range: { from: string; to: string }) => void;
  label?: string;
  className?: string;
  max?: string;
};

function formatRu(iso: string) {
  const [y, m, d] = iso.split("-");
  return y && m && d ? `${d}.${m}.${y}` : iso;
}

export function DateRangeFilter({
  from,
  to,
  onChange,
  label = "Период",
  className,
  max = utcToday(),
}: Props) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [portalContainer, setPortalContainer] = useState<Element | undefined>();
  const mobile = useIsMobile();

  useLayoutEffect(() => {
    setPortalContainer(findDialogPortal(rootRef.current));
  }, []);

  return (
    <div
      ref={rootRef}
      className={className ? `date-range-filter ${className}` : "date-range-filter"}
    >
      <DateRangePicker
        aria-label={label}
        value={{ start: parseDate(from), end: parseDate(to) }}
        maxValue={parseDate(max)}
        onChange={(range) => {
          if (!range?.start || !range?.end) {
            return;
          }
          onChange({ from: range.start.toString(), to: range.end.toString() });
        }}
      >
        <Label className="sr-only">{label}</Label>
        <DateField.Group fullWidth className="min-w-0">
          <DateRangePicker.Trigger
            className="filter-dropdown-trigger filter-field-group"
            aria-label={label}
          >
            <span className="filter-field-icon" aria-hidden>
              <IconCalendar />
            </span>
            <span className="filter-dropdown-value">
              {formatRu(from)} – {formatRu(to)}
            </span>
          </DateRangePicker.Trigger>
        </DateField.Group>
        <DateRangePicker.Popover
          placement={mobile ? "bottom" : "bottom end"}
          className="date-range-filter-popover"
          {...(portalContainer ? { UNSTABLE_portalContainer: portalContainer } : {})}
        >
          <RangeCalendar aria-label={label}>
            <RangeCalendar.Header>
              <RangeCalendar.YearPickerTrigger>
                <RangeCalendar.YearPickerTriggerHeading />
                <RangeCalendar.YearPickerTriggerIndicator />
              </RangeCalendar.YearPickerTrigger>
              <RangeCalendar.NavButton slot="previous" />
              <RangeCalendar.NavButton slot="next" />
            </RangeCalendar.Header>
            <RangeCalendar.Grid>
              <RangeCalendar.GridHeader>
                {(day) => <RangeCalendar.HeaderCell>{day}</RangeCalendar.HeaderCell>}
              </RangeCalendar.GridHeader>
              <RangeCalendar.GridBody>
                {(date) => <RangeCalendar.Cell date={date} />}
              </RangeCalendar.GridBody>
            </RangeCalendar.Grid>
            <RangeCalendar.YearPickerGrid>
              <RangeCalendar.YearPickerGridBody>
                {({ year }) => <RangeCalendar.YearPickerCell year={year} />}
              </RangeCalendar.YearPickerGridBody>
            </RangeCalendar.YearPickerGrid>
          </RangeCalendar>
        </DateRangePicker.Popover>
      </DateRangePicker>
    </div>
  );
}
