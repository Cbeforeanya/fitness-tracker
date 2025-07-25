// Cleaned and corrected version of the Chart component
import * as React from "react";
import * as RechartsPrimitive from "recharts";
import { cn } from "../../lib/utils";

const THEMES = { light: "", dark: ".dark" } as const;

export type ChartConfig = {
  [key: string]: {
    label?: React.ReactNode;
    icon?: React.ComponentType;
  } & (
    | { color?: string; theme?: never }
    | { color?: never; theme: Record<keyof typeof THEMES, string> }
  );
};

type ChartContextProps = {
  config: ChartConfig;
};

const ChartContext = React.createContext<ChartContextProps | null>(null);

function useChart() {
  const context = React.useContext(ChartContext);
  if (!context) {
    throw new Error("useChart must be used within a <ChartContainer />");
  }
  return context;
}

const ChartContainer = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div"> & {
    config: ChartConfig;
    children: React.ComponentProps<
      typeof RechartsPrimitive.ResponsiveContainer
    >["children"];
  }
>(({ id, className, children, config, ...props }, ref) => {
  const uniqueId = React.useId();
  const chartId = `chart-${id || uniqueId.replace(/:/g, "")}`;

  return (
    <ChartContext.Provider value={{ config }}>
      <div
        data-chart={chartId}
        ref={ref}
        className={cn(
          "flex aspect-video justify-center text-xs",
          className
        )}
        {...props}
      >
        <ChartStyle id={chartId} config={config} />
        <RechartsPrimitive.ResponsiveContainer>{children}</RechartsPrimitive.ResponsiveContainer>
      </div>
    </ChartContext.Provider>
  );
});
ChartContainer.displayName = "Chart";

const ChartStyle = ({ id, config }: { id: string; config: ChartConfig }) => {
  const themed = Object.entries(config).filter(
    ([, conf]) => conf.color || conf.theme
  );

  if (themed.length === 0) return null;

  const styleText = Object.entries(THEMES)
    .map(([theme, prefix]) => {
      const rules = themed
        .map(([key, conf]) => {
          const color =
            conf.theme?.[theme as keyof typeof THEMES] ?? conf.color;
          return color ? `  --color-${key}: ${color};` : null;
        })
        .filter(Boolean)
        .join("\n");
      return `${prefix} [data-chart=${id}] {\n${rules}\n}`;
    })
    .join("\n");

  return <style dangerouslySetInnerHTML={{ __html: styleText }} />;
};

const ChartTooltip = RechartsPrimitive.Tooltip;

const ChartTooltipContent = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<typeof RechartsPrimitive.Tooltip> &
    React.ComponentProps<"div"> & {
      hideLabel?: boolean;
      hideIndicator?: boolean;
      indicator?: "line" | "dot" | "dashed";
      nameKey?: string;
      labelKey?: string;
    }
>(({ active, payload, className, indicator = "dot", hideLabel = false,
    hideIndicator = false, label, labelFormatter, labelClassName, formatter, color, nameKey, labelKey }, ref) => {
  const { config } = useChart();

  const tooltipLabel = React.useMemo(() => {
    if (hideLabel || !payload?.length) return null;

    const [item] = payload;
    const key = `${labelKey || item.dataKey || item.name || "value"}`;
    const itemConfig = getPayloadConfigFromPayload(config, item, key);
    const value = !labelKey && typeof label === "string"
      ? config[label as keyof typeof config]?.label || label
      : itemConfig?.label;

    return value ? (
      <div className={cn("font-medium", labelClassName)}>
        {labelFormatter ? labelFormatter(value, payload) : value}
      </div>
    ) : null;
  }, [label, labelFormatter, payload, hideLabel, labelClassName, config, labelKey]);

  if (!active || !payload?.length) return null;
  const nestLabel = payload.length === 1 && indicator !== "dot";

  return (
    <div
      ref={ref}
      className={cn(
        "grid min-w-[8rem] items-start gap-1.5 rounded-lg border bg-background px-2.5 py-1.5 text-xs shadow-xl",
        className
      )}
    >
      {!nestLabel && tooltipLabel}
      <div className="grid gap-1.5">
        {payload.map((item, index) => {
          const key = `${nameKey || item.name || item.dataKey || "value"}`;
          const itemConfig = getPayloadConfigFromPayload(config, item, key);
          const indicatorColor = color || item.payload?.fill || item.color;

          return (
            <div
              key={item.dataKey}
              className={cn("flex w-full flex-wrap items-stretch gap-2")}
            >
              {formatter && item?.value !== undefined && item.name ? (
                formatter(item.value, item.name, item, index, item.payload)
              ) : (
                <>
                  {itemConfig?.icon ? (
                    <itemConfig.icon />
                  ) : (
                    !hideIndicator && (
                      <div
                        className={cn("shrink-0 rounded-[2px]", {
                          "h-2.5 w-2.5": indicator === "dot",
                          "w-1": indicator === "line",
                          "w-0 border border-dashed bg-transparent": indicator === "dashed",
                          "my-0.5": nestLabel && indicator === "dashed",
                        })}
                        style={{
                          backgroundColor: indicatorColor,
                          borderColor: indicatorColor,
                        }}
                      />
                    )
                  )}
                  <div className={cn("flex flex-1 justify-between leading-none")}>  
                    <div className="grid gap-1.5">
                      {nestLabel && tooltipLabel}
                      <span className="text-muted-foreground">
                        {itemConfig?.label || item.name}
                      </span>
                    </div>
                    {item.value && (
                      <span className="font-mono font-medium tabular-nums">
                        {item.value.toLocaleString()}
                      </span>
                    )}
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
});
ChartTooltipContent.displayName = "ChartTooltip";

const ChartLegend = RechartsPrimitive.Legend;

const ChartLegendContent = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div"> &
    Pick<RechartsPrimitive.LegendProps, "payload" | "verticalAlign"> & {
      hideIcon?: boolean;
      nameKey?: string;
    }
>(({ className, hideIcon = false, payload, verticalAlign = "bottom", nameKey }, ref) => {
  const { config } = useChart();

  if (!payload?.length) return null;

  return (
    <div
      ref={ref}
      className={cn(
        "flex items-center justify-center gap-4",
        verticalAlign === "top" ? "pb-3" : "pt-3",
        className
      )}
    >
      {payload.map((item) => {
        const key = `${nameKey || item.dataKey || "value"}`;
        const itemConfig = getPayloadConfigFromPayload(config, item, key);

        return (
          <div
            key={item.value}
            className="flex items-center gap-1.5"
          >
            {itemConfig?.icon && !hideIcon ? (
              <itemConfig.icon />
            ) : (
              <div
                className="h-2 w-2 shrink-0 rounded-[2px]"
                style={{ backgroundColor: item.color }}
              />
            )}
            {itemConfig?.label}
          </div>
        );
      })}
    </div>
  );
});
ChartLegendContent.displayName = "ChartLegend";

function getPayloadConfigFromPayload(
  config: ChartConfig,
  payload: any,
  key: string
) {
  const payloadPayload =
    typeof payload === "object" && payload !== null && "payload" in payload
      ? payload.payload
      : undefined;

  let configKey = key;

  if (typeof payload?.[key] === "string") {
    configKey = payload[key];
  } else if (typeof payloadPayload?.[key] === "string") {
    configKey = payloadPayload[key];
  }

  return config[configKey] ?? config[key];
}

export {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  ChartStyle,
};