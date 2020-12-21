function getDate(value) {
    let start_date = d3.timeParse(rki_dateFormat)("2020-01-02")
    return d3.timeFormat(rki_dateFormat)(d3.timeDay.offset(start_date, value))
}

function updateDate(value) {
    d3.selectAll('#onerightmiddle svg').remove();
    let date = getDate(value);
    bar_param_case_m.date = date
    bar_param_case_w.date = date
    bar_param_death_m.date = date
    bar_param_death_w.date = date
    text_stat_para.date = date
}

function updateStats() {
    draw_bar(bar_param_case_m)
    draw_bar(bar_param_case_w)
    draw_bar(bar_param_death_m)
    draw_bar(bar_param_death_w)
    set_text_statistic(text_stat_para)
}

function refresh_on_date_change(value) {
    updateDate(value)
    updateStats()
}

function refresh_on_resize() {
    d3.selectAll('#oneright svg').remove();
    draw_line(line_param_death)
    draw_line(line_param_case)
    updateStats()
    
    d3.selectAll('#content_sec1 svg').remove();
    draw_lines(transport_param)
    
    d3.selectAll('#content_sec2 svg').remove();
    draw_lines(econ_param)

    let thumb_height = $("#slider_containter").innerHeight()
    for (let j = 0; j < document.styleSheets[1].rules.length; j++) {
        let rule = document.styleSheets[1].rules[j];
        if (rule.cssText.match(".slider_thumb")) {
            rule.style.height = thumb_height + "px";
        }
    }

    d3.selectAll('#line_chart_transport_legend *').remove();
    d3.selectAll('#line_chart_econ_legend *').remove();
}

function refresh_on_state_change() {
    bar_param_case_m.src = data_rows;
    bar_param_case_w.src = data_rows;
    bar_param_death_m.src = data_rows;
    bar_param_death_w.src = data_rows;
    text_stat_para.src = data_rows;
    line_param_death.src = data_all;
    line_param_case.src = data_all;
}

function read_datasets(param){
    let datasets = []
    const n_data = param.data_files.length
    for (let i = 0; i < n_data; i++) {
        path = param.src + param.data_files[i]
        datasets[i] = d3.csv(path, function (d) {
            return {
                date: d3.timeParse("%m")(d[param.x]),
                value: d[param.y]
            }
        })
    }
    return datasets
}

function init_graph() {
    d3.csv(data_source, function (data) {
        let rki_data = {
            date: data.Meldedatum,
            date_parse: d3.timeParse(rki_dateFormat)(data.Meldedatum),
            total_cases: +data["AnzahlFall"],
            new_cases: +data["NeuerFall"],
            total_deaths: +data["AnzahlTodesfall"],
            new_deaths: +data["NeuerTodesfall"],
            death_rate: Math.round(data["Todesrate"] * 100) / 100
        }
        genders.forEach(gender => {
            types.forEach(type => {
                rki_data[gender + type] = {
                    "0-4": +data[gender + "_A00-A04_" + type],
                    "5-14": +data[gender + "_A05-A14_" + type],
                    "15-34": +data[gender + "_A15-A34_" + type],
                    "35-59": +data[gender + "_A35-A59_" + type],
                    "60-79": +data[gender + "_A60-A79_" + type],
                    "80+": +data[gender + "_A80+_" + type]
                };
            })
        });
        return rki_data
    }).then(function (data) {
        data_all = data
        data_rows = d3.index(data, d => d.date);
        // console.log(data_rows)
    }).then(function () {
        const dates = Array.from(data_rows.keys())
        const last_day = dates[dates.length - 1]
        let select_last_day = data_rows.get(last_day)
        genders.forEach(gender => {
            types.forEach(type => {
                let array = []
                Object.entries(select_last_day[gender + type]).forEach(ele => {
                    array.push({
                        age: ele[0],
                        value: ele[1]
                    });
                    bar_chart_config[gender + type] = {
                        x: d3.scaleLinear()
                            .domain([0, d3.max(array, function (d) {
                                return d.value;
                            })]),
                        y: d3.scaleBand()
                            .domain(array.map(function (d) {
                                return d.age;
                            }))
                    }
                });
            })
        });
        
        line_param_flight.datasets = read_datasets(line_param_flight)
        line_param_rail.datasets = read_datasets(line_param_rail)
        line_param_bike.datasets = read_datasets(line_param_bike)
        line_param_import.datasets = read_datasets(line_param_import)
        line_param_export.datasets = read_datasets(line_param_export)
        
        const slider = $("#date_slider");
        slider.attr('max', data_all.length - 1);
        let date = slider.val()
        updateDate(date);
        refresh_on_state_change();
        refresh_on_resize();
    })
}
init_graph();
