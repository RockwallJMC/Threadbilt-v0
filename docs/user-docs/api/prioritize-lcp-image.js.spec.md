This document specifies the functionality, interface, and requirements of a Lighthouse audit designed to detect opportunities for preloading the Largest Contentful Paint (LCP) image.

### 1. Primary Functionality

The system is a performance audit that analyzes a web page's load process to determine if the Largest Contentful Paint (LCP) could be improved by preloading the LCP image.

**Input:**
The audit takes a standard set of Lighthouse artifacts as input, which includes:
-   Trace data (`traces`)
-   DevTools network logs (`devtoolsLogs`)
-   Page context (`GatherContext`, `URL`)
-   Information about specific DOM elements from the trace (`TraceElements`)
-   Source maps for script analysis (`SourceMaps`)

**Processing:**
1.  **Identify LCP Element**: The audit first checks if the LCP element for the page was an image. If not, the audit is considered not applicable.
2.  **Identify LCP Image Request**: It identifies the specific network request corresponding to the LCP image.
3.  **Analyze Discovery Path**: The audit reconstructs the "initiator chain" for the LCP image request, tracing it back from the image request to the main document request. This path shows how the image was discovered (e.g., by the HTML parser, a CSS file, or a JavaScript file).
4.  **Determine Preload Candidacy**: It applies a set of rules to decide if the LCP image is a good candidate for preloading:
    -   The image must not already be preloaded (`<link rel="preload">`).
    -   The image must be a standard network resource (not a data URI, etc.).
    -   The image must belong to the main frame.
    -   The image must be "late-discovered". The heuristic for this is an initiator chain of more than two requests (e.g., `main_document -> script.js -> lcp_image.png`). An image discovered directly from the main document's HTML is not considered a candidate.
5.  **Simulate Preloading**: If the image is a candidate, the audit runs a simulation of the page load. It creates a modified version of the page's dependency graph where the LCP image request is initiated directly by the main document, mimicking the effect of a preload link.
6.  **Calculate Potential Savings**: It compares the simulated LCP time from the modified graph with the original simulated LCP time. The new LCP time is calculated as the maximum of:
    a. The time the image finishes downloading in the new simulation.
    b. The time the image element is actually rendered in the DOM (approximated by the completion time of its other dependencies).
    The difference between the original and new LCP times is the potential saving in milliseconds (`wastedMs`).

**Output:**
The audit produces a standard Lighthouse audit result object (`LH.Audit.Product`).
-   **Score**: `1` (pass) if no opportunity is found, `0` (fail) if an opportunity exists.
-   **Numeric Value**: The calculated potential savings in milliseconds (`wastedMs`).
-   **Details**: An "opportunity" table listing the URL of the LCP image, the DOM node, and the potential time savings.
-   **Debug Data**: Includes the reconstructed initiator path of the LCP image for debugging purposes.
-   **Metric Savings**: An object indicating the potential improvement to the LCP metric, equal to `wastedMs`.

### 2. Interface Contract

The code exposes a single class, `PrioritizeLcpImage`, which conforms to the Lighthouse `Audit` interface.

**Class: `PrioritizeLcpImage`**
-   **Extends**: `Audit`

**Public Static Methods:**

-   **`get meta(): LH.Audit.Meta`**
    -   **Description**: Returns metadata about the audit.
    -   **Returns**: An object containing:
        -   `id`: 'prioritize-lcp-image'
        -   `title`: A localized string, "Preload Largest Contentful Paint image".
        -   `description`: A localized, detailed description explaining the audit's purpose and linking to further documentation.
        -   `supportedModes`: `['navigation']`
        -   `guidanceLevel`: `4`
        -   `requiredArtifacts`: An array of strings listing required Lighthouse artifacts: `['traces', 'devtoolsLogs', 'GatherContext', 'URL', 'TraceElements', 'SourceMaps']`.
        -   `scoreDisplayMode`: `Audit.SCORING_MODES.METRIC_SAVINGS`.

-   **`audit(artifacts: LH.Artifacts, context: LH.Audit.Context): Promise<LH.Audit.Product>`**
    -   **Description**: The main entry point for running the audit. It orchestrates the analysis and simulation to produce the final result.
    -   **Parameters**:
        -   `artifacts: LH.Artifacts`: An object containing all the data gathered during the Lighthouse run.
        -   `context: LH.Audit.Context`: An object containing settings and context for the audit run.
    -   **Returns**: A `Promise` that resolves to the audit result object (`LH.Audit.Product`).

**Internal Static Methods (Exposed for modularity/testing):**

-   **`shouldPreloadRequest(request: LH.Artifacts.NetworkRequest, mainResource: LH.Artifacts.NetworkRequest, initiatorPath: InitiatorPath): boolean`**: Determines if a given network request is a candidate for a preload recommendation.
-   **`findLCPNode(graph: LH.Gatherer.Simulation.GraphNode, lcpRecord: NetworkRequest): LH.Gatherer.Simulation.GraphNetworkNode | undefined`**: Finds the simulation graph node corresponding to the LCP network request.
-   **`getLcpInitiatorPath(lcpRecord: NetworkRequest, mainResource: NetworkRequest): InitiatorPath`**: Reconstructs the chain of network requests that led to the LCP image being requested.
-   **`getLCPNodeToPreload(mainResource: LH.Artifacts.NetworkRequest, graph: LH.Gatherer.Simulation.GraphNode, lcpRecord: NetworkRequest | undefined): {lcpNodeToPreload?: LH.Gatherer.Simulation.GraphNetworkNode, initiatorPath?: InitiatorPath}`**: Combines logic to find the LCP node and determine if it should be preloaded.
-   **`computeWasteWithGraph(lcpElement: LH.Artifacts.TraceElement, lcpNode: LH.Gatherer.Simulation.GraphNetworkNode | undefined, graph: LH.Gatherer.Simulation.GraphNode, simulator: LH.Gatherer.Simulation.Simulator): {wastedMs: number, results: Array<Object>}`**: Performs the simulation to calculate potential time savings.

**Data Types:**

-   `InitiatorType`: A string that can be one of `LH.Crdp.Network.Initiator['type']` (e.g., 'parser', 'script'), `'redirect'`, or `'fallbackToMain'`.
-   `InitiatorPath`: An array of objects `Array<{url: string, initiatorType: InitiatorType}>`.

**Side Effects:**

-   The audit is a pure function with respect to the external environment. It reads from the provided `artifacts` and `context` but does not perform any I/O, network requests, or modify any state outside of its own execution scope.

### 3. Behavioral Details

**Edge Cases Handled:**
-   **No LCP or Non-Image LCP**: If the LCP element is not an image (e.g., a text block), the audit returns a `notApplicable: true` result.
-   **Already Preloaded Image**: If the LCP image is already requested via `<link rel="preload">`, it is not considered an opportunity, and the audit passes.
-   **Non-Network Resources**: If the LCP image is a data URI or blob URI, it is ignored as it cannot be preloaded over the network.
-   **Early-Discovered Image**: If the LCP image is discovered directly from the main document's HTML parser (initiator path length ≤ 2), it is considered efficiently loaded, and the audit passes.
-   **Cross-Frame LCP**: The audit currently only considers LCP images that are in the same frame as the main document.
-   **Missing LCP Request**: If the network request for the LCP image cannot be found in the provided artifacts, no opportunity will be identified.

**Error Conditions and Management:**
-   The code contains several internal assertions that throw `Error` objects. These occur if the internal state is inconsistent (e.g., the main document node or the LCP node cannot be found in a graph where it is expected to exist). These are considered fatal internal errors, not user-facing recoverable errors.
-   Failure to find dependent artifacts (e.g., `MainResource`) will cause the audit to fail, which is handled by the Lighthouse runner.

**Performance Characteristics:**
-   The audit's performance is dominated by the page load simulation (`LoadSimulator.request` and `simulator.simulate`).
-   The simulation involves graph cloning, traversal, and running a critical path analysis twice (before and after modification). The complexity is proportional to the number of nodes (requests, tasks) and edges (dependencies) in the page's dependency graph. For complex pages, this can be computationally intensive.

**Threading/Concurrency:**
-   The code is single-threaded JavaScript.
-   Asynchronous operations are managed using `async/await` syntax, primarily for requesting computed artifacts which may themselves perform significant computation.

### 4. Environmental Context

**Language:**
-   JavaScript (ECMAScript 2020 or newer).
-   Utilizes ES Modules (`import`/`export`).
-   Uses `import.meta.url` for path resolution.
-   Heavily annotated with JSDoc comments for static type checking.

**Framework Dependencies:**
-   **Lighthouse**: This code is a core audit within the Google Lighthouse framework. It relies on several key Lighthouse modules:
    -   `Audit`: The base class for all audits.
    -   `i18n`: For localizing UI strings.
    -   `NetworkRequest`: A utility class for analyzing network requests.
    -   Computed Artifacts: `MainResource`, `LanternLargestContentfulPaint`, `LoadSimulator`, `LCPImageRecord`. These are complex, computed inputs that provide the simulation graph and other necessary data.

**External System Dependencies:**
-   None. The audit operates entirely on data collected during a Lighthouse run. It does not communicate with any external databases, APIs, or services.

**Configuration Requirements:**
-   The audit is configured via the `context.settings` object provided by the Lighthouse runner. This object includes simulation parameters like CPU/network throttling settings, which directly impact the outcome of the `wastedMs` calculation.

### 5. Implicit Requirements

**Business Logic Constraints:**
-   The definition of a "late-discovered" image is implicitly defined by the initiator chain length (`initiatorPath.length > 2`). This heuristic assumes that an image referenced directly by the main document's HTML is optimal, and any longer chain represents a discovery delay.
-   The simulation makes a key assumption: a `<link rel="preload">` tag would cause the image request to be initiated by the main document's parser as a high-priority request.
-   The calculation of savings correctly accounts for the fact that an image cannot be painted until its corresponding DOM element exists. The final paint time is the maximum of when the image resource is available and when the DOM is ready for it.
-   The `initiatorType` 'fallbackToMain' indicates a broken initiator chain in the collected data. In this case, the audit conservatively assumes the chain goes back to the main resource to continue its analysis.

**Formatting or Data Structure Expectations:**
-   The audit requires the precise `LH.Artifacts` and `LH.Audit.Context` object schemas as defined by Lighthouse.
-   The simulation relies on the specific graph structure (`LH.Gatherer.Simulation.GraphNode`) produced by the Lantern engine, which represents network requests and CPU tasks as nodes in a dependency graph.

**Logging/Monitoring Expectations:**
-   The audit provides `debugData` in its output. This is a standard Lighthouse feature used for troubleshooting audit results. The `initiatorPath` and `pathLength` are provided to help users and developers understand why the audit made its recommendation.

**Security Considerations:**
-   There are no direct security considerations. The audit analyzes read-only data and does not process user input or execute any fetched code. It is an analysis tool, not a runtime component of a web application.
