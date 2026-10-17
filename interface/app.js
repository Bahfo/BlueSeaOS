"use strict";

document.addEventListener("DOMContentLoaded", () => {
  const root = document.documentElement;
  const topbar = document.querySelector(".topbar");
  const sidebarLinks = [
    ...document.querySelectorAll(".nav-links a[data-view]"),
  ];

  const mainContent = document.querySelector(".content");
  const heroDashboard = document.querySelector(".hero-dashboard");
  const searchInput = document.querySelector(".search-box input");

  if (!mainContent || !topbar || sidebarLinks.length === 0) {
    console.error("BlueSeaOS: Required application elements are missing.");
    return;
  }

  const originalOverviewHTML = mainContent.innerHTML;

  let activeView = "overview";
  let searchPanel = null;
  let themeButton = null;

  const applicationStartedAt = Date.now();

  const initialUptimeMinutes = 14 * 24 * 60 + 6 * 60 + 32;

  let lastDemoSample = null;

  const views = {
    devices: {
      title: "Devices Status",
      description:
        "Inspect connected clients, assigned addresses, and network activity.",

      cards: [
        {
          title: "Connected Devices",
          description:
            "View the clients reported by the router's DHCP leases " +
            "and supported network discovery tools.",
        },
        {
          title: "Device Details",
          description:
            "Inspect hostnames, assigned IP addresses, MAC addresses, " +
            "and available connection information.",
        },
        {
          title: "Traffic Statistics",
          description:
            "Review network traffic measurements by interface or " +
            "client when telemetry becomes available.",
        },
        {
          title: "Device Access",
          description:
            "Plan device allowlists, blocklists, and access controls " +
            "using validated router configuration.",
        },
      ],
    },

    network: {
      title: "Network Configuration",
      description: "Manage WAN, LAN, routing, addressing, DHCP, and DNS.",

      cards: [
        {
          title: "WAN Interface",
          description:
            "Configure the internet-facing interface, connection " +
            "protocol, addressing, and gateway.",
        },
        {
          title: "LAN Configuration",
          description:
            "Manage local IP addressing, bridge interfaces, " +
            "and subnet configuration.",
        },
        {
          title: "DHCP Server",
          description:
            "Configure address pools, lease durations, and " +
            "reserved addresses.",
        },
        {
          title: "DNS and Routing",
          description:
            "Inspect DNS configuration, routing tables, " +
            "and default gateway settings.",
        },
        {
          title: "VLAN Management",
          description:
            "Plan VLAN-based segmentation where the selected " +
            "network hardware supports it.",
        },
        {
          title: "Interface Diagnostics",
          description:
            "Inspect link state, interface counters, and " +
            "connectivity diagnostics.",
        },
      ],
    },

    firewall: {
      title: "Firewall & Security",
      description:
        "Manage network protection, traffic policies, and isolation.",

      cards: [
        {
          title: "Firewall Zones",
          description:
            "Review WAN, LAN, guest, and other configured " +
            "network security zones.",
        },
        {
          title: "Traffic Rules",
          description:
            "Manage validated rules governing inbound, outbound, " +
            "and forwarded traffic.",
        },
        {
          title: "Network Isolation",
          description:
            "Plan guest network restrictions and inter-network " +
            "access policies.",
        },
        {
          title: "Port Forwarding",
          description:
            "Inspect and manage explicitly authorized forwarding " +
            "rules and exposed services.",
        },
        {
          title: "Security Status",
          description:
            "Display security-relevant configuration and " +
            "events collected by the system.",
        },
        {
          title: "Access Control",
          description:
            "Configure administrative access with explicit " +
            "permissions and validation.",
        },
      ],
    },

    shell: {
      title: "BlueSea Shell",
      description:
        "A future administrative console for controlled system operations.",

      cards: [
        {
          title: "Command Console",
          description:
            "Provide a controlled interface for approved diagnostic " +
            "and administrative commands.",
        },
        {
          title: "Operation Permissions",
          description:
            "Define an explicit allowlist of supported commands " +
            "and operations.",
        },
        {
          title: "Execution Results",
          description:
            "Display validated command output and errors " +
            "without exposing unrestricted shell access.",
        },
        {
          title: "Audit History",
          description:
            "Record administrative operations and relevant " +
            "results for review.",
        },
      ],
    },

    services: {
      title: "Services",
      description:
        "Inspect and manage software integrated into the BlueSeaOS image.",

      cards: [
        {
          title: "Service Inventory",
          description:
            "Display the services built into the firmware and " +
            "their startup configuration.",
        },
        {
          title: "Service Status",
          description:
            "Inspect service health and later provide controlled " +
            "start, stop, and restart operations.",
        },
        {
          title: "Logs and Diagnostics",
          description: "Review relevant service logs and troubleshooting data.",
        },
        {
          title: "Custom Services",
          description:
            "Manage additional services as they are integrated " +
            "into future firmware builds.",
        },
        {
          title: "Service Configuration",
          description: "Provide validated settings for supported services.",
        },
        {
          title: "Service Dependencies",
          description:
            "Document required packages, startup order, and " +
            "service dependencies.",
        },
      ],
    },

    settings: {
      title: "Settings",
      description: "Configure device preferences and administrative settings.",

      cards: [
        {
          title: "Device Identity",
          description:
            "Manage the device hostname and supported identity settings.",
        },
        {
          title: "Administrator Access",
          description:
            "Manage authentication, account permissions, and session policy.",
        },
        {
          title: "Appearance",
          description: "Select the BlueSeaOS light or dark interface theme.",
        },
        {
          title: "Firmware Information",
          description:
            "Display the installed firmware release, build revision, " +
            "and hardware target.",
        },
        {
          title: "Updates and Recovery",
          description:
            "Prepare validated firmware update, backup, and recovery " +
            "workflows.",
        },
        {
          title: "System Diagnostics",
          description:
            "Collect system information and diagnostic data " +
            "for troubleshooting.",
        },
      ],
    },
  };

  /* -----------------------------------------------------
       Generic DOM Helpers
       ----------------------------------------------------- */

  function createElement(tag, className, text) {
    const element = document.createElement(tag);

    if (className) {
      element.className = className;
    }

    if (text !== undefined) {
      element.textContent = text;
    }

    return element;
  }

  function setStatusBadgeText(badge, text) {
    if (!badge) {
      return;
    }

    const dot = badge.querySelector(".status-dot");

    if (dot) {
      badge.replaceChildren(dot, document.createTextNode(text));
    } else {
      badge.textContent = text;
    }
  }

  function createDevelopmentBanner() {
    if (document.querySelector(".prototype-banner")) {
      return;
    }

    const banner = createElement("div", "prototype-banner");

    banner.setAttribute("role", "note");

    const dot = createElement("span", "status-dot");

    dot.setAttribute("aria-hidden", "true");

    const heading = createElement("strong", "", "Development mode");

    const message = createElement(
      "p",
      "",
      "Router telemetry is simulated. The interface is not yet " +
        "connected to an OpenWrt management API. Displayed values " +
        "must not be treated as live measurements.",
    );

    banner.append(dot, heading, message);

    topbar.insertAdjacentElement("afterend", banner);
  }

  function createThemeButton() {
    themeButton = document.getElementById("theme-toggle");

    if (!themeButton) {
      themeButton = createElement("button", "theme-toggle", "Dark theme");

      themeButton.id = "theme-toggle";
      themeButton.type = "button";

      const userProfile = topbar.querySelector(".user-profile");

      if (userProfile) {
        topbar.insertBefore(themeButton, userProfile);
      } else {
        topbar.append(themeButton);
      }
    }

    themeButton.addEventListener("click", () => {
      const nextTheme = root.dataset.theme === "dark" ? "light" : "dark";

      applyTheme(nextTheme, true);
    });

    let savedTheme = "light";

    try {
      const storedTheme = localStorage.getItem("blueseaos-theme");

      if (storedTheme === "light" || storedTheme === "dark") {
        savedTheme = storedTheme;
      }
    } catch (error) {
      /*
       * Some restricted browser contexts block storage.
       * Theme switching still works for the current page.
       */
    }

    applyTheme(savedTheme, false);
  }

  function applyTheme(theme, persist) {
    const selectedTheme = theme === "dark" ? "dark" : "light";

    root.dataset.theme = selectedTheme;

    themeButton.textContent =
      selectedTheme === "dark" ? "Light theme" : "Dark theme";

    themeButton.setAttribute(
      "aria-label",
      selectedTheme === "dark"
        ? "Switch to light theme"
        : "Switch to dark theme",
    );

    themeButton.setAttribute("aria-pressed", String(selectedTheme === "dark"));

    themeButton.title =
      selectedTheme === "dark"
        ? "Switch to the light appearance"
        : "Switch to the dark appearance";

    if (persist) {
      try {
        localStorage.setItem("blueseaos-theme", selectedTheme);
      } catch (error) {
        /*
         * Storage is optional; do not break the interface
         * if the browser blocks local storage.
         */
      }
    }
  }

  function prepareOverview() {
    const metricCards = [
      ...mainContent.querySelectorAll(".metrics-summary .metric-card"),
    ];

    const metricIds = [
      "overview-metric-cpu",
      "overview-metric-memory",
      "overview-metric-wan",
      "overview-metric-system",
    ];

    metricCards.forEach((card, index) => {
      card.id = metricIds[index] || `overview-metric-${index}`;
    });

    const dashboardCards = [
      ...mainContent.querySelectorAll(".dashboard-grid > .card"),
    ];

    if (dashboardCards[0]) {
      dashboardCards[0].id = "overview-performance";
    }

    if (dashboardCards[1]) {
      dashboardCards[1].id = "overview-interfaces";
    }

    /*
     * Do not present static HTML examples as live interface
     * health or verified link speeds.
     */
    mainContent.querySelectorAll(".status-table tbody tr").forEach((row) => {
      const statusBadge = row.cells[1]?.querySelector(".status-badge");

      if (statusBadge) {
        statusBadge.classList.add("status-demo");
        setStatusBadgeText(statusBadge, "Demo data");
      }

      if (row.cells[2]) {
        row.cells[2].textContent = "—";
      }
    });

    const systemStatus = mainContent.querySelector(
      ".metrics-summary .metric-card:last-child .status-badge",
    );

    if (systemStatus) {
      systemStatus.classList.add("status-demo");
      setStatusBadgeText(systemStatus, "Demo mode");
    }

    const chart = document.getElementById("performance-chart");

    if (chart) {
      const chartContainer = chart.parentElement;

      let legend = chartContainer.querySelector(".chart-legend");

      if (!legend) {
        legend = createElement("div", "chart-legend");

        const cpuItem = createElement("span", "chart-legend-item");

        const cpuDot = createElement(
          "span",
          "chart-legend-dot chart-legend-cpu",
        );

        cpuDot.setAttribute("aria-hidden", "true");

        cpuItem.append(cpuDot, document.createTextNode("CPU usage"));

        const memoryItem = createElement("span", "chart-legend-item");

        const memoryDot = createElement(
          "span",
          "chart-legend-dot chart-legend-memory",
        );

        memoryDot.setAttribute("aria-hidden", "true");

        memoryItem.append(memoryDot, document.createTextNode("Memory usage"));

        legend.append(cpuItem, memoryItem);

        chartContainer.insertBefore(legend, chart);
      }

      let footnote = chartContainer.querySelector(".chart-footnote");

      if (!footnote) {
        footnote = createElement(
          "p",
          "chart-footnote",
          "Illustrative sample readings — live system telemetry " +
            "will be connected after the management API is implemented.",
        );

        chartContainer.append(footnote);
      }
    }
  }

  function createPageHeading(view) {
    const section = createElement("section", "page-heading");
    const group = createElement("div");

    group.append(
      createElement("p", "eyebrow", "Router management"),
      createElement("h1", "", view.title),
      createElement("p", "page-description", view.description),
    );

    const status = createElement("span", "system-badge");
    const dot = createElement("span", "status-dot");
    dot.setAttribute("aria-hidden", "true");
    status.append(dot, document.createTextNode("Backend not connected"));
    section.append(group, status);
    return section;
  }

  function createPlaceholderNotice() {
    const notice = createElement("section", "placeholder-notice");

    notice.append(
      createElement("h2", "", "Section under development"),
      createElement(
        "p",
        "",
        "This section describes the planned BlueSeaOS capabilities. " +
          "It does not yet read or modify router configuration. " +
          "Backend operations will be added after authentication, " +
          "permission checks, input validation, and error handling " +
          "have been implemented.",
      ),
    );

    return notice;
  }

  function createPlaceholderCard(item, viewKey, index) {
    const card = createElement("article", "placeholder-card");

    card.id = `${viewKey}-feature-${index}`;
    const number = createElement(
      "span",
      "placeholder-number",
      String(index + 1).padStart(2, "0"),
    );

    const title = createElement("h3", "", item.title);
    const description = createElement("p", "", item.description);
    const status = createElement(
      "span",
      "placeholder-status",
      "Integration pending",
    );

    card.append(number, title, description, status);
    return card;
  }

  function renderPlaceholderPage(viewKey) {
    const view = views[viewKey];

    if (!view) {return;}
    const fragment = document.createDocumentFragment();

    fragment.append(createPageHeading(view), createPlaceholderNotice());
    fragment.append(createElement("section", "section-heading"));

    const sectionHeading = fragment.querySelector(".section-heading");
    sectionHeading.append(createElement("h2", "", "Planned capabilities"));
    const grid = createElement("section", "placeholder-grid");

    grid.setAttribute("aria-label", `${view.title} planned capabilities`);
    view.cards.forEach((item, index) => {
      grid.append(createPlaceholderCard(item, viewKey, index));
    });

    fragment.append(grid);
    mainContent.replaceChildren(fragment);
  }

  function updateActiveNavigation(viewKey) {
    sidebarLinks.forEach((link) => {
      const isActive = link.dataset.view === viewKey;
      link.classList.toggle("active", isActive);

      if (isActive) {
        link.setAttribute("aria-current", "page");
      } else {
        link.removeAttribute("aria-current");
      }
    });
  }

  function showView(viewKey, targetId = null) {
    const isOverview = viewKey === "overview";

    if (!isOverview && !views[viewKey]) return;

    activeView = viewKey;
    updateActiveNavigation(viewKey);

    if (heroDashboard) {
      heroDashboard.hidden = !isOverview;
    }
    if (isOverview) {
      mainContent.innerHTML = originalOverviewHTML;
      prepareOverview();
      document.title = "BlueSeaOS - Enterprise Router Management";
      updateDashboardData();
    } else {
      renderPlaceholderPage(viewKey);
      document.title = `BlueSeaOS - ${views[viewKey].title}`;
    }

    if (targetId) {
      requestAnimationFrame(() => {
        const target = document.getElementById(targetId);

        if (target) {
          target.scrollIntoView({behavior: "auto",block: "center",});
        }
      });
    }
  }

  sidebarLinks.forEach((link) => {
    link.addEventListener("click", (event) => {
      event.preventDefault();
      showView(link.dataset.view);
    });
  });

  function getDemoTelemetry() {
    const cpu = Number((9 + Math.random() * 23).toFixed(1));
    const memory = Number((38 + Math.random() * 10).toFixed(1));
    const clients = 21 + Math.floor(Math.random() * 7);
    const elapsedIntervals = Math.floor(
      (Date.now() - applicationStartedAt) / 5000,
    );

    const dhcpRequests = 1428 + elapsedIntervals;
    const wanMbps = Number((48 + Math.random() * 42).toFixed(1));
    const elapsedMinutes = Math.floor(
      (Date.now() - applicationStartedAt) / 60000,
    );

    const totalMinutes = initialUptimeMinutes + elapsedMinutes;
    const days = Math.floor(totalMinutes / 1440);
    const hours = Math.floor((totalMinutes % 1440) / 60);
    const minutes = totalMinutes % 60;

    const history = [
      { time: "12:00", cpu: 12, memory: 41 },
      { time: "12:05", cpu: 15, memory: 42 },
      { time: "12:10", cpu: 18, memory: 43 },
      { time: "12:15", cpu: 14, memory: 42 },
      { time: "12:20", cpu: 22, memory: 44 },
      { time: "12:25", cpu: 16, memory: 42 },
      { time: "12:30", cpu, memory },
    ];

    return {
      cpuUsage: cpu,
      memoryUsage: memory,
      activeLanClients: clients,
      dhcpRequests,
      wanMbps,
      uptime: `${days}d ${hours}h ${minutes}m`,
      history,
    };
  }

  function renderPerformanceChart(historyData) {
    const chartContainer = document.getElementById("performance-chart");

    if (!chartContainer) {
      return;
    }

    chartContainer.replaceChildren();
    historyData.forEach((point) => {
      const group = createElement("div", "chart-bar-group");
      group.title =
        `${point.time} — CPU: ${point.cpu}%, ` + `Memory: ${point.memory}%`;

      group.setAttribute("role", "group");
      group.setAttribute("aria-label", group.title);

      const pair = createElement("div", "chart-bar-pair");
      const cpuBar = createElement("div", "chart-bar cpu");
      cpuBar.style.height = `${Math.max(2, Math.min(point.cpu, 100))}%`;
      cpuBar.setAttribute("aria-hidden", "true");
      const memoryBar = createElement("div", "chart-bar memory");
      memoryBar.style.height = `${Math.max(2, Math.min(point.memory, 100))}%`;
      memoryBar.setAttribute("aria-hidden", "true");
      pair.append(cpuBar, memoryBar);
      const label = createElement("span", "chart-label", point.time);
      group.append(pair, label);
      chartContainer.append(group);
    });
  }

  function updateDashboardData() {
    if (activeView !== "overview") return;

    const data = getDemoTelemetry();

    const cpuMetric = document.getElementById("metric-cpu");
    const memoryMetric = document.getElementById("metric-mem");
    const clientsMetric = document.getElementById("active-lan-clients");
    const dhcpMetric = document.getElementById("dhcp-requests-num");
    const uptimeMetric = document.getElementById("router-uptime");

    const metricValues = [
      ...document.querySelectorAll(
        ".metrics-summary .metric-card .metric-value",
      ),
    ];

    const wanMetric = document.getElementById("metric-wan") || metricValues[2];

    if (cpuMetric) cpuMetric.textContent = `${data.cpuUsage}%`;

    if (memoryMetric) {
      memoryMetric.textContent = `${data.memoryUsage}%`;
    }

    if (wanMetric) {
      wanMetric.textContent = `${data.wanMbps} Mbps`;
    }

    if (clientsMetric) {
      clientsMetric.textContent = String(data.activeLanClients);
    }

    if (dhcpMetric) {
      dhcpMetric.textContent = data.dhcpRequests.toLocaleString();
    }

    if (uptimeMetric) {
      uptimeMetric.textContent = data.uptime;
    }

    renderPerformanceChart(data.history);
    lastDemoSample = data;
  }

  function setupGlobalSearch() {
    if (!searchInput) return;

    searchInput.id = "global-search";
    searchInput.type = "search";
    searchInput.autocomplete = "off";
    searchInput.setAttribute("aria-label", "Search router settings and status");
    searchInput.setAttribute("aria-controls", "search-results");
    searchInput.setAttribute("aria-expanded", "false");
    const searchBox = searchInput.closest(".search-box");

    if (!searchBox) return;

    searchPanel = createElement("div", "search-results");
    searchPanel.id = "search-results";
    searchPanel.hidden = true;
    searchPanel.setAttribute("role", "listbox");
    searchPanel.setAttribute("aria-label", "Search results");

    searchBox.append(searchPanel);
    searchInput.addEventListener("input", () => {
      renderSearchResults(searchInput.value);
    });

    searchInput.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        closeSearchResults();
        searchInput.blur();
        return;
      }

      if (event.key === "Enter") {
        const firstResult = searchPanel.querySelector(".search-result");

        if (firstResult && !searchPanel.hidden) {
          event.preventDefault();
          firstResult.click();
        }
      }

      if (event.key === "ArrowDown" && !searchPanel.hidden) {
        const firstResult = searchPanel.querySelector(".search-result");

        if (firstResult) {
          event.preventDefault();
          firstResult.focus();
        }
      }
    });

    document.addEventListener("pointerdown", (event) => {
      if (!searchBox.contains(event.target)) {
        closeSearchResults();
      }
    });

    document.addEventListener("keydown", (event) => {
      const isSearchShortcut =
        (event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k";

      if (isSearchShortcut) {
        event.preventDefault();
        searchInput.focus();
        searchInput.select();
      }
    });
  }

  function buildSearchIndex() {
    const entries = [];

    sidebarLinks.forEach((link) => {
      const viewKey = link.dataset.view;

      entries.push({
        title: link.textContent.trim(),
        description: "Open this router management section.",
        type: "Section",
        viewKey,
      });
    });

    const overviewFeatures = [
      {
        title: "CPU Usage",
        description: "Router processor utilization.",
        targetId: "overview-metric-cpu",
      },
      {
        title: "Memory Usage",
        description: "Router memory utilization.",
        targetId: "overview-metric-memory",
      },
      {
        title: "WAN Throughput",
        description: "Internet interface traffic throughput.",
        targetId: "overview-metric-wan",
      },
      {
        title: "System Status",
        description: "Router operational status.",
        targetId: "overview-metric-system",
      },
      {
        title: "Active LAN Clients",
        description: "Devices reported on the local network.",
        targetId: "active-lan-clients",
      },
      {
        title: "DHCP Requests",
        description: "DHCP request statistics.",
        targetId: "dhcp-requests-num",
      },
      {
        title: "Router Uptime",
        description: "System uptime information.",
        targetId: "router-uptime",
      },
      {
        title: "Performance Chart",
        description: "CPU and memory demonstration readings.",
        targetId: "overview-performance",
      },
      {
        title: "System Interfaces",
        description: "WAN, LAN, and wireless interface information.",
        targetId: "overview-interfaces",
      },
    ];

    overviewFeatures.forEach((feature) => {
      entries.push({
        ...feature,
        viewKey: "overview",
        type: "Overview",
      });
    });

    Object.entries(views).forEach(([viewKey, view]) => {
      view.cards.forEach((card, index) => {
        entries.push({
          title: card.title,
          description: card.description,
          targetId: `${viewKey}-feature-${index}`,
          viewKey,
          type: view.title,
        });
      });
    });

    return entries;
  }

  const searchIndex = buildSearchIndex();

  function closeSearchResults() {
    if (!searchPanel) {
      return;
    }

    searchPanel.hidden = true;

    if (searchInput) {
      searchInput.setAttribute("aria-expanded", "false");
    }
  }

  function createSearchResult(entry) {
    const button = createElement("button", "search-result");

    button.type = "button";
    button.setAttribute("role", "option");

    const main = createElement("span", "search-result-main");

    main.append(
      createElement("strong", "", entry.title),
      createElement("small", "", entry.description),
    );

    const type = createElement("span", "search-result-type", entry.type);

    button.append(main, type);

    button.addEventListener("click", () => {
      showView(entry.viewKey);

      searchInput.value = "";
      closeSearchResults();

      requestAnimationFrame(() => {
        const target = entry.targetId
          ? document.getElementById(entry.targetId)
          : null;

        if (target) {
          target.scrollIntoView({
            behavior: "auto",
            block: "center",
          });
        }
      });
    });

    return button;
  }

  function renderSearchResults(query) {
    if (!searchPanel) {
      return;
    }

    const normalizedQuery = query.trim().toLowerCase();

    searchPanel.replaceChildren();

    if (!normalizedQuery) {
      closeSearchResults();
      return;
    }

    const terms = normalizedQuery.split(/\s+/);

    const results = searchIndex
      .filter((entry) => {
        const searchableText = [entry.title, entry.description, entry.type]
          .join(" ")
          .toLowerCase();

        return terms.every((term) => searchableText.includes(term));
      })
      .slice(0, 8);

    if (results.length === 0) {
      searchPanel.append(
        createElement(
          "p",
          "search-results-empty",
          "No matching section or capability was found.",
        ),
      );
    } else {
      results.forEach((entry) => {
        searchPanel.append(createSearchResult(entry));
      });
    }

    searchPanel.hidden = false;

    searchInput.setAttribute("aria-expanded", "true");
  }

  createDevelopmentBanner();
  createThemeButton();
  setupGlobalSearch();
  showView("overview");

  window.setInterval(() => {
    updateDashboardData();
  }, 5000);
});
