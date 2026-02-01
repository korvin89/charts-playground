// Simplified type definitions for @gravity-ui/charts
// These types are used by Monaco Editor for autocompletion

export const chartTypeDefinitions = `
/** Type of axis scale */
type ChartAxisType = 'category' | 'datetime' | 'linear' | 'logarithmic';

/** Dash style for lines */
type DashStyle = 'Solid' | 'Dash' | 'Dot' | 'ShortDashDot' | 'LongDash' | 'LongDashDot' | 'LongDashDotDot';

/** Text style options */
interface BaseTextStyle {
  fontSize?: string;
  fontWeight?: string | number;
  fontColor?: string;
}

/** Axis labels configuration */
interface ChartAxisLabels {
  /** Enable or disable the axis labels */
  enabled?: boolean;
  /** The label's pixel distance from the perimeter of the plot area. @default 10 */
  margin?: number;
  /** The pixel padding for axis labels. @default 4 */
  padding?: number;
  /** Date format string */
  dateFormat?: string;
  /** Text style for labels */
  style?: Partial<BaseTextStyle>;
  /** For horizontal axes, enable label rotation to prevent overlapping labels */
  autoRotation?: boolean;
  /** Rotation of the labels in degrees. @default 0 */
  rotation?: number;
  /** Allows to use HTML tags for category axis. @default false */
  html?: boolean;
  /** Maximum width of axis labels */
  maxWidth?: number | string;
  /** Custom formatter function */
  formatter?: (value: any) => string;
}

/** Axis title configuration */
interface ChartAxisTitle {
  /** Title text */
  text?: string;
  /** CSS styles for the title */
  style?: Partial<BaseTextStyle>;
  /** Pixel distance between axis labels and title. @default 4 for horizontal, 8 for vertical */
  margin?: number;
  /** Title alignment */
  align?: 'left' | 'center' | 'right';
}

/** Plot line configuration */
interface AxisPlotLine {
  /** Position of the line in axis units */
  value?: number;
  /** Color of the plot line (hex, rgba) */
  color?: string;
  /** Pixel width of the plot line. @default 1 */
  width?: number;
  /** Line stroke style */
  dashStyle?: DashStyle;
  /** Place line before or after chart */
  layerPlacement?: 'before' | 'after';
  /** Line opacity. @default 1 */
  opacity?: number;
  /** Label for plot line */
  label?: {
    text: string;
    style?: Partial<BaseTextStyle>;
    padding?: number;
  };
}

/** Plot band configuration */
interface AxisPlotBand {
  /** Start position of the plot band */
  from: number | string | null;
  /** End position of the plot band */
  to: number | string | null;
  /** Color of the plot band */
  color?: string;
  /** Place band before or after chart */
  layerPlacement?: 'before' | 'after';
  /** Band opacity. @default 1 */
  opacity?: number;
}

/** Crosshair configuration */
interface AxisCrosshair {
  /** Enable or disable crosshair. @default false */
  enabled?: boolean;
  /** Snap to points or follow pointer. @default true */
  snap?: boolean;
  /** Crosshair color */
  color?: string;
  /** Crosshair width. @default 1 */
  width?: number;
  /** Crosshair dash style */
  dashStyle?: DashStyle;
}

/** Base axis configuration */
interface ChartAxis {
  /** Category labels for category axis */
  categories?: string[];
  /** Timestamps for datetime axis */
  timestamps?: number[];
  /** Axis type */
  type?: ChartAxisType;
  /** Axis labels configuration */
  labels?: ChartAxisLabels;
  /** Color of the axis line */
  lineColor?: string;
  /** Axis title */
  title?: ChartAxisTitle;
  /** Minimum axis value */
  min?: number;
  /** Maximum axis value */
  max?: number;
  /** Grid lines settings */
  grid?: {
    /** Enable or disable grid lines. @default true */
    enabled?: boolean;
  };
  /** Tick marks settings */
  ticks?: {
    /** Tick interval */
    interval?: number | string;
  };
  /** Padding of max value. @default 0.05 for Y, 0.01 for X */
  maxPadding?: number;
  /** Array of plot lines */
  plotLines?: AxisPlotLine[];
  /** Array of plot bands */
  plotBands?: AxisPlotBand[];
  /** Whether axis should be visible */
  visible?: boolean;
  /** Axis values order */
  order?: 'sortAsc' | 'sortDesc' | 'reverse';
  /** Force axis to start on tick. @default true for X axis */
  startOnTick?: boolean;
  /** Force axis to end on tick. @default true for X axis */
  endOnTick?: boolean;
  /** Crosshair configuration */
  crosshair?: AxisCrosshair;
}

/** X axis configuration */
interface ChartXAxis extends ChartAxis {
  /** Range slider configuration */
  rangeSlider?: {
    /** Enable range slider. @default false */
    enabled?: boolean;
    /** Height in pixels. @default 40 */
    height?: number;
    /** Margin from axis. @default 10 */
    margin?: number;
  };
}

/** Y axis configuration */
interface ChartYAxis extends ChartAxis {
  /** Axis position */
  position?: 'left' | 'right';
  /** Plot index for split charts */
  plotIndex?: number;
}

/** Point marker options */
interface PointMarkerOptions {
  /** Enable markers. @default true for scatter, varies for others */
  enabled?: boolean;
  /** Marker radius. @default 4 */
  radius?: number;
  /** Border width. @default 0 */
  borderWidth?: number;
  /** Border color */
  borderColor?: string;
}

/** Hover state options */
interface BasicHoverState {
  /** Enable hover styles. @default true */
  enabled?: boolean;
  /** Brightness adjustment on hover. @default 0.3 */
  brightness?: number;
}

/** Inactive state options */
interface BasicInactiveState {
  /** Enable inactive styles. @default true */
  enabled?: boolean;
  /** Opacity when inactive. @default 0.5 */
  opacity?: number;
}

/** Base series data point */
interface BaseSeriesData<T = any> {
  /** X value */
  x?: number | string;
  /** Y value */
  y?: number;
  /** Point color override */
  color?: string;
  /** Custom data attached to point */
  custom?: T;
}

/** Line series data point */
interface LineSeriesData<T = any> extends BaseSeriesData<T> {
  x: number | string;
  y: number;
}

/** Bar series data point */
interface BarSeriesData<T = any> extends BaseSeriesData<T> {
  x: number | string;
  y: number;
}

/** Pie series data point */
interface PieSeriesData<T = any> {
  /** Slice name */
  name: string;
  /** Slice value */
  value: number;
  /** Slice color */
  color?: string;
  /** Custom data */
  custom?: T;
}

/** Scatter series data point */
interface ScatterSeriesData<T = any> extends BaseSeriesData<T> {
  x: number;
  y: number;
  /** Point radius */
  radius?: number;
}

/** Treemap series data point */
interface TreemapSeriesData<T = any> {
  /** Node name */
  name: string;
  /** Node value */
  value?: number;
  /** Node color */
  color?: string;
  /** Child nodes */
  children?: TreemapSeriesData<T>[];
  /** Custom data */
  custom?: T;
}

/** Heatmap series data point */
interface HeatmapSeriesData<T = any> {
  /** X position */
  x: number | string;
  /** Y position */
  y: number | string;
  /** Cell value */
  value: number;
  /** Cell color */
  color?: string;
  /** Custom data */
  custom?: T;
}

/** Sankey series data point (link) */
interface SankeySeriesData<T = any> {
  /** Source node */
  from: string;
  /** Target node */
  to: string;
  /** Link weight */
  weight: number;
  /** Custom data */
  custom?: T;
}

/** Radar series data point */
interface RadarSeriesData<T = any> {
  /** Category name */
  category: string;
  /** Value */
  value: number;
  /** Custom data */
  custom?: T;
}

/** Waterfall series data point */
interface WaterfallSeriesData<T = any> {
  /** X category */
  x: string;
  /** Y value (positive for increase, negative for decrease) */
  y?: number;
  /** Mark as total/subtotal column */
  total?: boolean;
  /** Mark as subtotal column */
  subtotal?: boolean;
  /** Custom data */
  custom?: T;
}

/** Funnel series data point */
interface FunnelSeriesData<T = any> {
  /** Stage name */
  name: string;
  /** Stage value */
  value: number;
  /** Stage color */
  color?: string;
  /** Custom data */
  custom?: T;
}

/** Data labels configuration */
interface DataLabels {
  /** Enable data labels. @default false */
  enabled?: boolean;
}

/** Base series configuration */
interface BaseSeries<T = any> {
  /** Series name shown in legend and tooltip */
  name: string;
  /** Series color */
  color?: string;
  /** Show series in legend. @default true */
  showInLegend?: boolean;
  /** Y axis index for multi-axis charts. @default 0 */
  yAxis?: number;
  /** Data labels configuration */
  dataLabels?: DataLabels;
  /** Series visibility. @default true */
  visible?: boolean;
}

/** Line series */
interface LineSeries<T = any> extends BaseSeries<T> {
  type: 'line';
  /** Data points */
  data: LineSeriesData<T>[];
  /** Line width. @default 1 */
  lineWidth?: number;
  /** Line dash style. @default 'Solid' */
  dashStyle?: DashStyle;
  /** Point markers */
  marker?: PointMarkerOptions;
  /** Stacking mode */
  stacking?: 'normal' | 'percent';
}

/** Area series */
interface AreaSeries<T = any> extends BaseSeries<T> {
  type: 'area';
  /** Data points */
  data: LineSeriesData<T>[];
  /** Line width. @default 1 */
  lineWidth?: number;
  /** Point markers */
  marker?: PointMarkerOptions;
  /** Stacking mode */
  stacking?: 'normal' | 'percent';
  /** Area opacity. @default 0.75 */
  opacity?: number;
}

/** Bar-X series (vertical bars) */
interface BarXSeries<T = any> extends BaseSeries<T> {
  type: 'bar-x';
  /** Data points */
  data: BarSeriesData<T>[];
  /** Stacking mode */
  stacking?: 'normal' | 'percent';
}

/** Bar-Y series (horizontal bars) */
interface BarYSeries<T = any> extends BaseSeries<T> {
  type: 'bar-y';
  /** Data points */
  data: BarSeriesData<T>[];
  /** Stacking mode */
  stacking?: 'normal' | 'percent';
}

/** Scatter series */
interface ScatterSeries<T = any> extends BaseSeries<T> {
  type: 'scatter';
  /** Data points */
  data: ScatterSeriesData<T>[];
  /** Point markers */
  marker?: PointMarkerOptions;
}

/** Pie series */
interface PieSeries<T = any> extends BaseSeries<T> {
  type: 'pie';
  /** Data points */
  data: PieSeriesData<T>[];
  /** Inner radius for donut chart (0-100% or pixels) */
  innerRadius?: number | string;
  /** Outer radius */
  radius?: number | string;
  /** Border width between slices. @default 1 */
  borderWidth?: number;
  /** Border color */
  borderColor?: string;
  /** Center position [x, y] */
  center?: [string | number, string | number];
}

/** Treemap series */
interface TreemapSeries<T = any> extends BaseSeries<T> {
  type: 'treemap';
  /** Data points (hierarchical) */
  data: TreemapSeriesData<T>[];
}

/** Heatmap series */
interface HeatmapSeries<T = any> extends BaseSeries<T> {
  type: 'heatmap';
  /** Data points */
  data: HeatmapSeriesData<T>[];
}

/** Sankey series */
interface SankeySeries<T = any> extends BaseSeries<T> {
  type: 'sankey';
  /** Links data */
  data: SankeySeriesData<T>[];
}

/** Radar series */
interface RadarSeries<T = any> extends BaseSeries<T> {
  type: 'radar';
  /** Data points */
  data: RadarSeriesData<T>[];
}

/** Waterfall series */
interface WaterfallSeries<T = any> extends BaseSeries<T> {
  type: 'waterfall';
  /** Data points */
  data: WaterfallSeriesData<T>[];
}

/** Funnel series */
interface FunnelSeries<T = any> extends BaseSeries<T> {
  type: 'funnel';
  /** Data points */
  data: FunnelSeriesData<T>[];
}

/** All series types */
type ChartSeries<T = any> = 
  | LineSeries<T>
  | AreaSeries<T>
  | BarXSeries<T>
  | BarYSeries<T>
  | ScatterSeries<T>
  | PieSeries<T>
  | TreemapSeries<T>
  | HeatmapSeries<T>
  | SankeySeries<T>
  | RadarSeries<T>
  | WaterfallSeries<T>
  | FunnelSeries<T>;

/** Series options for specific chart types */
interface ChartSeriesOptions {
  /** Data labels for all series */
  dataLabels?: DataLabels;
  /** Bar-X specific options */
  'bar-x'?: {
    /** Max bar width. @default 50 */
    barMaxWidth?: number;
    /** Padding between bars. @default 0.1 */
    barPadding?: number;
    /** Padding between groups. @default 0.2 */
    groupPadding?: number;
    /** Border radius. @default 0 */
    borderRadius?: number;
    /** States styling */
    states?: {
      hover?: BasicHoverState;
      inactive?: BasicInactiveState;
    };
  };
  /** Bar-Y specific options */
  'bar-y'?: {
    /** Max bar width. @default 50 */
    barMaxWidth?: number;
    /** Padding between bars. @default 0.1 */
    barPadding?: number;
    /** Padding between groups. @default 0.2 */
    groupPadding?: number;
    /** Border width. @default 0 */
    borderWidth?: number;
    /** Border color */
    borderColor?: string;
    /** Border radius. @default 0 */
    borderRadius?: number;
    /** States styling */
    states?: {
      hover?: BasicHoverState;
      inactive?: BasicInactiveState;
    };
  };
  /** Pie specific options */
  pie?: {
    /** States styling */
    states?: {
      hover?: BasicHoverState;
      inactive?: BasicInactiveState;
    };
  };
  /** Line specific options */
  line?: {
    /** Line width. @default 1 */
    lineWidth?: number;
    /** Dash style. @default 'Solid' */
    dashStyle?: DashStyle;
    /** Point markers */
    marker?: PointMarkerOptions;
    /** States styling */
    states?: {
      hover?: BasicHoverState;
      inactive?: BasicInactiveState;
    };
  };
  /** Area specific options */
  area?: {
    /** Line width. @default 1 */
    lineWidth?: number;
    /** Point markers */
    marker?: PointMarkerOptions;
    /** States styling */
    states?: {
      hover?: BasicHoverState;
      inactive?: BasicInactiveState;
    };
  };
  /** Scatter specific options */
  scatter?: {
    /** States styling */
    states?: {
      hover?: BasicHoverState;
      inactive?: BasicInactiveState;
    };
  };
}

/** Legend configuration */
interface ChartLegend {
  /** Enable legend. @default true */
  enabled?: boolean;
  /** Legend position */
  position?: 'top' | 'right' | 'bottom' | 'left';
  /** Items alignment */
  align?: 'start' | 'center' | 'end';
  /** Legend item click behavior */
  itemClick?: 'toggleVisibility' | 'none';
  /** Legend title */
  title?: {
    text?: string;
    style?: Partial<BaseTextStyle>;
  };
  /** Item spacing */
  itemDistance?: number;
}

/** Chart title configuration */
interface ChartTitle {
  /** Title text */
  text?: string;
  /** Text style */
  style?: Partial<BaseTextStyle>;
}

/** Tooltip data passed to formatter */
interface TooltipData<T = any> {
  /** Point X value */
  x: number | string;
  /** Point Y value */
  y: number;
  /** Series name */
  series: string;
  /** Series color */
  color: string;
  /** Custom data from point */
  custom?: T;
}

/** Tooltip configuration */
interface ChartTooltip<T = any> {
  /** Enable tooltip. @default true */
  enabled?: boolean;
  /** Show tooltip for all series at once. @default false */
  shared?: boolean;
  /** Custom tooltip formatter */
  formatter?: (data: TooltipData<T>) => string;
  /** Header formatter for shared tooltip */
  headerFormatter?: (value: any) => string;
}

/** General chart options */
interface ChartOptions {
  /** Chart margin [top, right, bottom, left] or single value */
  margin?: number | [number, number, number, number];
  /** Background color */
  backgroundColor?: string;
  /** Animation options */
  animation?: {
    enabled?: boolean;
  };
  /** Events */
  events?: {
    /** Click on chart area */
    click?: (event: any) => void;
  };
}

/** Split chart configuration */
interface ChartSplit {
  /** Enable split mode */
  enabled?: boolean;
  /** Gap between plots */
  gap?: number;
  /** Plot configurations */
  plots?: {
    /** Plot height */
    height?: number | string;
  }[];
}

/**
 * Main chart configuration type.
 * 
 * Use this type to define chart configuration with full autocompletion support.
 * 
 * @example
 * \`\`\`typescript
 * const data = getData();
 * 
 * const chartConfig: ChartData = {
 *   series: {
 *     data: [
 *       { type: 'line', data: data, name: 'My Series' }
 *     ]
 *   },
 *   xAxis: { type: 'linear' },
 *   yAxis: [{ title: { text: 'Values' } }],
 *   title: { text: 'My Chart' }
 * };
 * \`\`\`
 */
interface ChartData<T = any> {
  /** General chart options */
  chart?: ChartOptions;
  
  /** Legend configuration */
  legend?: ChartLegend;
  
  /**
   * Series data and options.
   * This is the main content of the chart.
   */
  series: {
    /** Array of series to display */
    data: ChartSeries<T>[];
    /** Global series options by type */
    options?: ChartSeriesOptions;
  };
  
  /** Chart main title */
  title?: ChartTitle;
  
  /** Tooltip configuration */
  tooltip?: ChartTooltip<T>;
  
  /** X axis configuration */
  xAxis?: ChartXAxis;
  
  /** Y axis configuration (can be array for multi-axis) */
  yAxis?: ChartYAxis[];
  
  /** Split chart configuration */
  split?: ChartSplit;
  
  /**
   * Color palette for series.
   * If no color is set in series, colors are assigned from this list.
   * @default ['#4DA2F1', '#FF3D64', '#8AD554', '#FFC636', ...]
   */
  colors?: string[];
}

/**
 * Retrieves the data from data.json editor.
 * Call this function to get parsed JSON data.
 * 
 * @returns Parsed data from data.json
 * 
 * @example
 * \`\`\`typescript
 * // Simple usage
 * const data = getData();
 * 
 * // With destructuring
 * const { series1, series2 } = getData();
 * 
 * // With type annotation
 * const data = getData() as MyDataType[];
 * \`\`\`
 */
declare function getData<T = any>(): T;
`;
