# Escher - Code Wiki Documentation

Escher is a web-based tool for building, viewing, sharing, and embedding data-rich visualizations of biological pathways (metabolic maps). 

## 1. Overall Project Architecture

Escher follows a hybrid architecture, combining a rich, interactive JavaScript/React frontend for visualization with a Python backend package for data manipulation and Jupyter Notebook integration.

- **Frontend (JavaScript)**: Built using Preact and D3.js. It handles the rendering of the biological pathways (metabolites, reactions, genes) as interactive SVG graphics. It includes a full UI for map building and data visualization.
- **Backend (Python)**: The `escher` Python package integrates closely with `COBRApy` to load metabolic models and map flux or omics data onto the pathways. It functions as a standalone HTML generator and a Jupyter Notebook/Lab widget.
- **Data Layer**: Escher uses a specific JSON schema (version 1-0-0) to store pathway maps. Biological models are typically provided in COBRA JSON format.

---

## 2. Responsibilities of Major Modules

| Directory | Description |
| :--- | :--- |
| `src/` | The core JavaScript codebase. Contains all UI components, D3 rendering logic, state management, and the `Builder` API. |
| `py/` | The Python backend package (`escher`). Provides the Jupyter widget implementation, data handling for COBRApy models, and functions to export standalone HTML files. |
| `docs/` | Sphinx-based documentation containing tutorials, API references, and development guides. |
| `jupyter/` | Scripts and configurations for Jupyter Notebook and Jupyter Lab extensions. |
| `icons/` | Custom font icons (Fontello) and CSS used in the Escher UI. |

---

## 3. Key Classes and Functions

### JavaScript (Frontend)

- **`Builder` (`src/Builder.jsx`)**
  The main entry point for the Escher UI. It initializes the environment, orchestrates the loading of map and model data, and manages the UI overlays (menus, search bars, tooltips, settings). It binds the map state to the user interface.
  
- **`Map` (`src/Map.js`)**
  The core visualization engine. It manages the SVG canvas and uses D3.js to draw reactions, nodes (metabolites), bezier curves, and text labels. It also handles user interactions like dragging, selecting, and zooming.
  
- **`CobraModel` (`src/CobraModel.js`)**
  Parses and stores COBRA metabolic models on the client side. It maintains dictionaries of reactions, metabolites, and genes, allowing the `Map` to validate structural edits and map datasets to biological entities.

- **`ZoomContainer` (`src/ZoomContainer.js`)**
  Manages the pan and zoom behavior of the SVG canvas using D3 zoom behaviors.

### Python (Backend)

- **`Builder` (`py/escher/plots.py`)**
  A Jupyter `DOMWidget` that wraps the JavaScript Escher viewer for use in Python. It accepts `COBRApy` models, Pandas DataFrames (for reaction/metabolite data), and syncs this data to the frontend widget.
  - *Key Method*: `save_html(filepath)` - Renders the map and its data into a self-contained, standalone HTML file using Jinja2 templates.

- **`map_json_for_name(map_name)` & `model_json_for_name(model_name)`**
  Helper functions in `plots.py` that fetch standard JSON maps and metabolic models directly from the Escher server.

---

## 4. Dependency Relationships

### JavaScript Dependencies (from `package.json`)
- **D3.js suite** (`d3-selection`, `d3-zoom`, `d3-scale`, etc.): Powers the SVG rendering, scaling, and interactive behaviors (drag, brush, zoom).
- **Preact**: Used for building the UI components (menus, buttons, settings panel) efficiently.
- **Bacon.js**: Functional reactive programming library used for managing event streams and state changes (e.g., settings streams).
- **Underscore.js**: General utility functions for data manipulation.

### Python Dependencies (from `setup.py`)
- **COBRApy**: Essential for reading, manipulating, and analyzing genome-scale metabolic models.
- **ipywidgets**: Allows the Python `Builder` class to communicate bidirectionally with the Jupyter Notebook frontend.
- **Jinja2**: Used for rendering the standalone HTML templates.
- **Pandas**: Used to pass data arrays (fluxes, transcriptomics) directly into the Escher map.

---

## 5. Instructions for Running the Project

### JavaScript Development

Escher uses Webpack for its build process. You need Node.js (>=5.0) and `npm` or `yarn`.

```bash
# Install dependencies
npm install

# Run a local development server
npm run start

# Build for production
npm run build

# Run JavaScript tests
npm run test
```

### Python / Jupyter Development

To develop the Python package, you must first build the JavaScript bundle and copy it over.

```bash
# Build JS and copy to the py/ directory
npm install
npm run build
npm run copy

# Install the Python package in editable mode
cd py
pip install -e .

# Run Python tests
pytest
```

**Jupyter Notebook Extension:**
```bash
cd py
jupyter nbextension install --py --symlink escher
jupyter nbextension enable --py escher
```

**Jupyter Lab Extension:**
```bash
# In the root directory
yarn watch # Keep this running to compile JS changes

# In a new terminal
jupyter labextension install @jupyter-widgets/jupyterlab-manager
jupyter labextension link
jupyter lab --watch
```