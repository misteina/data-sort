window.onload = function(){
    var req = new XMLHttpRequest();
    req.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            try {
                data = JSON.parse(this.responseText);
            } catch (err) {
                data = null;
                error();
                return;
            }
            showChart();
        }
    };
    req.open("GET", location.origin + "/data", true);
    req.send();
}

function error(){
    var error = document.createElement('div');
    error.setAttribute('id', 'error');
    error.innerHTML = 'An error was encountered while loading data';
    document.querySelector('body').style.overflow = 'hidden';
    document.getElementById('content').appendChild(error);
}

function showChart(e = null) {

    var class_labelElem = document.getElementById('class_label');
    var sensorElem = document.getElementById('sensor');
    var osvElem = document.getElementById('osv');
    var avsvElem = document.getElementById('avsv');
    var hlvElem = document.getElementById('hlv');
    var avsvtip = document.getElementById('avsvtip');
    var hlvtip = document.getElementById('hlvtip');

    var classlabel = class_labelElem.value;
    var sensor = sensorElem.value;
    var osv = osvElem.value;
    var avsv = avsvElem.value;
    var hlv = hlvElem.value;

    if (sensor === 'All') {
        avsvElem.removeAttribute('disabled', 'disabled');
        hlvElem.removeAttribute('disabled', 'disabled');
        avsvtip.removeAttribute('class', 'tooltip');
        hlvtip.removeAttribute('class', 'tooltip');
        avsvElem.style.color = 'white';
        hlvElem.style.color = 'white';
    } else {
        avsvElem.setAttribute('disabled', 'disabled');
        hlvElem.setAttribute('disabled', 'disabled');
        avsvtip.setAttribute('class', 'tooltip');
        hlvtip.setAttribute('class', 'tooltip');
        avsvElem.style.color = 'black';
        hlvElem.style.color = 'black';
        avsvElem.value = 'no';
        hlvElem.value = 'no';
    }
    if (hlv === 'yes'){
        avsvElem.value = 'no';
        avsvElem.setAttribute('disabled', 'disabled');
        avsvtip.setAttribute('class', 'tooltip');
        avsvElem.style.color = 'black';
    } else if (sensor === 'All'){
        avsvElem.removeAttribute('disabled', 'disabled');
        avsvtip.removeAttribute('class', 'tooltip');
        avsvElem.style.color = 'white';
    }
    if (avsv === 'yes'){
        hlvElem.value = 'no';
        hlvElem.setAttribute('disabled', 'disabled');
        hlvElem.style.color = 'black';
        hlvtip.setAttribute('class', 'tooltip');
    } else if (sensor === 'All'){
        hlvElem.removeAttribute('disabled', 'disabled');
        hlvElem.style.color = 'white';
        hlvtip.removeAttribute('class', 'tooltip');

    }
    if (e !== null) {
        if (e.target.id !== 'osv') {
            osvElem.value = 'no';
            osv = 'no';
        }
    }

    var titleText = null;
    var seriesData = null;
    var xaxis = {};
    var categories = [];
    var cdata = { sensor_data: { class_label: [], 'sample index':[] } };

    function processData(i){
        if (sensor !== 'All') {
            if (typeof cdata.sensor_data[sensor] === 'undefined') cdata.sensor_data[sensor] = [];
            cdata.sensor_data[sensor].push(data.sensor_data[sensor][i]);
            cdata.sensor_data['class_label'].push(data.sensor_data['class_label'][i]);
            cdata.sensor_data['sample index'].push(data.sensor_data['sample index'][i]);
        } else {
            Object.keys(data.sensor_data).forEach(function (key) {
                if (typeof cdata.sensor_data[key] === 'undefined') cdata.sensor_data[key] = [];
                cdata.sensor_data[key].push(data.sensor_data[key][i]);
            });
        }
        categories.push(i);
    }
    for (var i = 0; i < data.sensor_data['class_label'].length; i++) {
        if (data.sensor_data['class_label'][i] === parseFloat(classlabel)) {
            var j = parseInt(data.sensor_data['sample index'][i].replace(/^\D+/g, ''));
            processData(j);
        } else if (classlabel === 'both'){
            processData(i);
        }
    }
    xaxis.categories = categories;

    if (hlv !== 'no' && avsv === 'no' && sensor === 'All'){
        var tempcdata = { sensor_data: {} };
        for (var i = 0; i < cdata.sensor_data['sample index'].length; i++) {
            var arr = [];
            Object.keys(cdata.sensor_data).forEach(function (key) {
                if (key !== 'sample index' && key !== 'class_label') {
                    arr.push(cdata.sensor_data[key][i]);
                }
            });
            arr.sort(function (a, b) { return a - b });
            if (typeof tempcdata.sensor_data.highest === 'undefined') tempcdata.sensor_data.highest = [];
            if (typeof tempcdata.sensor_data.lowest === 'undefined') tempcdata.sensor_data.lowest = [];
            tempcdata.sensor_data.highest.push(arr[arr.length - 1]);
            tempcdata.sensor_data.lowest.push(arr[0]);
        }
        cdata = tempcdata;
    }

    if (avsv !== 'no' && sensor === 'All' && hlv === 'no'){
        var avrg = [];
        for (var i = 0; i < cdata.sensor_data['sample index'].length;i++){
            var av = 0;
            Object.keys(cdata.sensor_data).forEach(function (key) {
                if (key !== 'sample index' && key !== 'class_label') {
                    av += cdata.sensor_data[key][i];
                }
            });
            avrg.push(av / 10);
        }
        cdata = {sensor_data: {Average: avrg}};
    }

    if (osv === 'yes') {
        if (avsv === 'no'){
            if (hlv !== 'no'){
                xaxis = [];
                var obj = { sensor_data: {} };
                Object.keys(cdata.sensor_data).forEach(function (key) {
                    var arr = [];
                    var tempcat = [];
                    for (var i = 0; i < cdata.sensor_data[key].length; i++) {
                        arr.push({ x: categories[i], y: cdata.sensor_data[key][i] })
                    }
                    arr.sort(function (a, b) { return a.y - b.y });
                    for (var i of arr) {
                        if (typeof obj.sensor_data[key] === 'undefined') obj.sensor_data[key] = [];
                        obj.sensor_data[key].push(i.y);
                        tempcat.push(i.x);
                    }
                    xaxis.push({
                        visible: false,
                        categories: tempcat
                    });
                });
                cdata = obj;
                
            } else {
                var arr = [];
                var obj = { sensor_data: {} };
                var len = cdata.sensor_data['sample index'].length;
                var start = cdata.sensor_data['sample index'].sort(function (a, b) { return a - b })[0];
                var stop = cdata.sensor_data['sample index'].sort(function (a, b) { return a - b })[len - 1];
                start = parseInt(start.replace(/^\D+/g, ''));
                stop = parseInt(stop.replace(/^\D+/g, ''));
                var j = 0;
                for (var i = start; i <= stop; i++) {
                    if (sensor !== 'All') {
                        arr.push({ x: i, y: cdata.sensor_data[sensor][j] });
                    } else {
                        Object.keys(cdata.sensor_data).forEach(function (key) {
                            if (key !== 'class_label' && key !== 'sample index') {
                                if (typeof obj.sensor_data[key] === 'undefined') obj.sensor_data[key] = [];
                                obj.sensor_data[key].push({ x: i, y: cdata.sensor_data[key][j] });
                            }
                        });
                    }
                    j++;
                }
                if (sensor != 'All') {
                    arr.sort(function (a, b) { return a.y - b.y });
                    categories = [];
                    cdata = { sensor_data: { [sensor]: [] } }
                    for (var i of arr) {
                        categories.push(i.x);
                        cdata.sensor_data[sensor].push(i.y);
                    }
                    xaxis.categories = categories;
                } else {
                    xaxis = [];
                    categories = [];
                    cdata = { sensor_data: {} }
                    Object.keys(obj.sensor_data).forEach(function (key) {
                        obj.sensor_data[key].sort(function (a, b) { return a.y - b.y });
                        for (var i of obj.sensor_data[key]) {
                            categories.push(i.x);
                            if (typeof cdata.sensor_data[key] === 'undefined') cdata.sensor_data[key] = [];
                            cdata.sensor_data[key].push(i.y);
                        }
                        xaxis.push({
                            visible: false,
                            categories: categories
                        });
                        categories = [];
                    });
                }
            }
        } else {
            var arr = [];
            for (var i = 0;i < categories.length;i++){
                arr.push({ x: categories[i], y: cdata.sensor_data.Average[i]});
            }
            var temp = [];
            arr.sort(function (a, b) { return a.y - b.y });
            categories = [];
            for (var i of arr) {
                categories.push(i.x);
                temp.push(i.y);
            }
            xaxis.categories = categories;
            cdata.sensor_data.Average = temp;
        }
    }

    if (classlabel === '1.0' || classlabel === '-1.0'){
        if (sensor !== 'All'){
            if (osv === 'yes'){
                titleText = sensor + ' Values For Class ' + classlabel + ' Samples in Ascending Order';
            } else {
                titleText = sensor + ' Values For Class ' + classlabel + ' Samples';
            }
            seriesData = [{ name: sensor, color: '#ff0000', visible: true, data: cdata.sensor_data[sensor] }];
        } else {
            if (avsv === 'yes'){
                if (osv === 'yes'){
                    titleText = 'Average Sensor Value For Each Sample In Class (' + classlabel + ') In Ascending Order';
                } else {
                    titleText = 'Average Sensor Value For Each Sample In Class (' + classlabel + ')';
                }
                seriesData = [{ name: 'Average', color: '#ff0000', visible: true, data: cdata.sensor_data.Average }];
            } else {
                if (osv === 'yes') {
                    if (hlv === 'yes'){
                        titleText = 'Highest And Lowest Sensor Values For Each Sample In Class (' + classlabel + ') In Ascending Order';
                        seriesData = [
                            { name: 'Highest', color: '#ff0000', xAxis: 0, visible: true, data: cdata.sensor_data['highest'] },
                            { name: 'Lowest', color: '#0000ff', xAxis: 1, visible: true, data: cdata.sensor_data['lowest'] },
                        ];
                    } else {
                        titleText = 'Sensor Values For Each Sample In Class (' + classlabel + ') In Ascending Order';
                        seriesData = [
                            { name: 'sensor0', color: '#ff0000', xAxis: 0, visible: true, data: cdata.sensor_data['sensor0'] },
                            { name: 'sensor1', color: '#90ee90', xAxis: 1, visible: true, data: cdata.sensor_data['sensor1'] },
                            { name: 'sensor2', color: '#e800e8', xAxis: 2, visible: true, data: cdata.sensor_data['sensor2'] },
                            { name: 'sensor3', color: '#00bfff', xAxis: 3, visible: true, data: cdata.sensor_data['sensor3'] },
                            { name: 'sensor4', color: '#ffa500', xAxis: 4, visible: true, data: cdata.sensor_data['sensor4'] },
                            { name: 'sensor5', color: '#ffff00', xAxis: 5, visible: true, data: cdata.sensor_data['sensor5'] },
                            { name: 'sensor6', color: '#0001ff', xAxis: 6, visible: true, data: cdata.sensor_data['sensor6'] },
                            { name: 'sensor7', color: '#a52a2a', xAxis: 7, visible: true, data: cdata.sensor_data['sensor7'] },
                            { name: 'sensor8', color: '#f77c92', xAxis: 8, visible: true, data: cdata.sensor_data['sensor8'] },
                            { name: 'sensor9', color: '#5e81b5', xAxis: 9, visible: true, data: cdata.sensor_data['sensor9'] }
                        ];
                    }
                } else {
                    xaxis.visible = true;
                    if (hlv === 'yes') {
                        titleText = 'Highest And Lowest Sensor Values For Each Sample In Class (' + classlabel + ')';
                        seriesData = [
                            { name: 'Highest', color: '#0000ff', xAxis: 0, visible: true, data: cdata.sensor_data['highest'] },
                            { name: 'Lowest', color: '#ff0000', xAxis: 0, visible: true, data: cdata.sensor_data['lowest'] },
                        ];
                    } else {
                        titleText = 'Sensor Values For Each Sample In Class (' + classlabel + ')';
                        seriesData = [
                            { name: 'sensor0', color: '#ff0000', xAxis: 0, visible: true, data: cdata.sensor_data['sensor0'] },
                            { name: 'sensor1', color: '#90ee90', xAxis: 0, visible: true, data: cdata.sensor_data['sensor1'] },
                            { name: 'sensor2', color: '#e800e8', xAxis: 0, visible: true, data: cdata.sensor_data['sensor2'] },
                            { name: 'sensor3', color: '#00bfff', xAxis: 0, visible: true, data: cdata.sensor_data['sensor3'] },
                            { name: 'sensor4', color: '#ffa500', xAxis: 0, visible: true, data: cdata.sensor_data['sensor4'] },
                            { name: 'sensor5', color: '#ffff00', xAxis: 0, visible: true, data: cdata.sensor_data['sensor5'] },
                            { name: 'sensor6', color: '#0001ff', xAxis: 0, visible: true, data: cdata.sensor_data['sensor6'] },
                            { name: 'sensor7', color: '#a52a2a', xAxis: 0, visible: true, data: cdata.sensor_data['sensor7'] },
                            { name: 'sensor8', color: '#f77c92', xAxis: 0, visible: true, data: cdata.sensor_data['sensor8'] },
                            { name: 'sensor9', color: '#5e81b5', xAxis: 0, visible: true, data: cdata.sensor_data['sensor9'] }
                        ];
                    }
                }
            }
        }
    } else {
        if (sensor !== 'All'){
            if (osv === 'yes'){
                titleText = sensor + ' Values For Both Class Samples In Ascending Order';
            } else {
                titleText = sensor + ' Values For Both Class Samples';
            }
            seriesData = [{ name: sensor, color: '#ff0000', visible: true, data: cdata.sensor_data[sensor] }];
        } else  {
            if (osv === 'yes'){
                if (avsv === 'yes') {
                    titleText = 'Average Sensor Value For Each Sample In All Classes In Ascending Order';
                    seriesData = [{ name: 'Average', color: '#ff0000', visible: true, data: cdata.sensor_data.Average }];
                } else {
                    if (hlv === 'yes') {
                        titleText = 'Highest And Lowest Sensor Values For Each Sample In Both Classes In Ascending Order';
                        seriesData = [
                            { name: 'Highest', color: '#ff0000', xAxis: 0, visible: true, data: cdata.sensor_data['highest'] },
                            { name: 'Lowest', color: '#0000ff', xAxis: 1, visible: true, data: cdata.sensor_data['lowest'] },
                        ];
                    } else {
                        titleText = 'Sensor Value For Each Sample In All Classes In Ascending Order';
                        seriesData = [
                            { name: 'sensor0', color: '#ff0000', xAxis: 0, visible: true, data: cdata.sensor_data['sensor0'] },
                            { name: 'sensor1', color: '#90ee90', xAxis: 1, visible: true, data: cdata.sensor_data['sensor1'] },
                            { name: 'sensor2', color: '#e800e8', xAxis: 2, visible: true, data: cdata.sensor_data['sensor2'] },
                            { name: 'sensor3', color: '#00bfff', xAxis: 3, visible: true, data: cdata.sensor_data['sensor3'] },
                            { name: 'sensor4', color: '#ffa500', xAxis: 4, visible: true, data: cdata.sensor_data['sensor4'] },
                            { name: 'sensor5', color: '#ffff00', xAxis: 5, visible: true, data: cdata.sensor_data['sensor5'] },
                            { name: 'sensor6', color: '#0001ff', xAxis: 6, visible: true, data: cdata.sensor_data['sensor6'] },
                            { name: 'sensor7', color: '#a52a2a', xAxis: 7, visible: true, data: cdata.sensor_data['sensor7'] },
                            { name: 'sensor8', color: '#f77c92', xAxis: 8, visible: true, data: cdata.sensor_data['sensor8'] },
                            { name: 'sensor9', color: '#5e81b5', xAxis: 9, visible: true, data: cdata.sensor_data['sensor9'] }
                        ];
                    }
                }
            } else {
                if (avsv === 'yes') {
                    titleText = 'Average Sensor Values For Both Class Samples';
                    seriesData = [{ name: 'Average', color: '#ff0000', visible: true, data: cdata.sensor_data.Average }];
                } else {
                    xaxis.visible = true;
                    if (hlv === 'yes') {
                        titleText = 'Highest And Lowest Sensor Values For Each sample In Both Class Samples';
                        seriesData = [
                            { name: 'Highest', color: '#0000ff', xAxis: 0, visible: true, data: cdata.sensor_data['highest'] },
                            { name: 'Lowest', color: '#ff0000', xAxis: 0, visible: true, data: cdata.sensor_data['lowest'] },
                        ];
                    } else {
                        titleText = 'Sensor Values For Both Class Samples';
                        seriesData = [
                            { name: 'sensor0', color: '#ff0000', xAxis: 0, visible: true, data: cdata.sensor_data['sensor0'] },
                            { name: 'sensor1', color: '#90ee90', xAxis: 0, visible: true, data: cdata.sensor_data['sensor1'] },
                            { name: 'sensor2', color: '#e800e8', xAxis: 0, visible: true, data: cdata.sensor_data['sensor2'] },
                            { name: 'sensor3', color: '#00bfff', xAxis: 0, visible: true, data: cdata.sensor_data['sensor3'] },
                            { name: 'sensor4', color: '#ffa500', xAxis: 0, visible: true, data: cdata.sensor_data['sensor4'] },
                            { name: 'sensor5', color: '#ffff00', xAxis: 0, visible: true, data: cdata.sensor_data['sensor5'] },
                            { name: 'sensor6', color: '#0001ff', xAxis: 0, visible: true, data: cdata.sensor_data['sensor6'] },
                            { name: 'sensor7', color: '#a52a2a', xAxis: 0, visible: true, data: cdata.sensor_data['sensor7'] },
                            { name: 'sensor8', color: '#f77c92', xAxis: 0, visible: true, data: cdata.sensor_data['sensor8'] },
                            { name: 'sensor9', color: '#5e81b5', xAxis: 0, visible: true, data: cdata.sensor_data['sensor9'] }
                        ];
                    }
                }
            }
        }
    }

    if (Array.isArray(xaxis)){
        for (var i of xaxis){
            i.labels = { style: { color: '#8a8a8a' } };
            i.title = { text: 'Samples', style: { "color": "#8a8a8a" } };
        }
    } else {
        xaxis.labels = { style: { color: '#8a8a8a' } };
        xaxis.title = { text: 'Samples', style: { "color": "#8a8a8a" } };
    }
    if (classlabel === 'both' && osv !== 'yes'){
        xaxis.plotBands = [
            {from: 0, to: 200, borderWidth: 1, borderColor: '#313131', color: '#141414', label: {text: 'Class 1.0', style: {color : '#8a8a8a'}}},
            { from: 200, to: 400, borderWidth: 1, borderColor: '#313131', color: '#141414', label: { text: 'Class -1.0', style: {color: '#8a8a8a'} } }
        ];
    } else if (classlabel !== 'both'){
        xaxis.plotBands = [
            { from: 0, to: 200, borderWidth: 1, borderColor: '#313131', color: '#141414', label: { text: 'Class '+classlabel, style: { color: '#8a8a8a' } } }
        ];
    } else if (osv === 'yes'){
        xaxis.plotBands = [];
    }
    config = {
        chart: { type: 'area', backgroundColor: '#141414' },
        title: { text: titleText, style: { "color": "#8a8a8a", "font-size": "15px" } },
        plotOptions: { series: { lineWidth: 2, fillOpacity: 0.4 }},
        tooltip: {
            headerFormat: '<span style="font-size: 10px">Sample {point.key}</span><br/>'
        },
        yAxis: {
            gridLineColor: '#666666',
            labels: { style: { color: '#a7a5a5' } },
            title: { text: 'Sensor Values', style: { "color": "#a7a5a5" } }
        },
        xAxis: xaxis,
        legend: {
            layout: 'vertical',
            align: 'right',
            verticalAlign: 'middle',
            itemStyle: { color: '#CCCCCC' },
            itemHiddenStyle: { color: '#444444' },
            itemHoverStyle: { color: 'grey' }
        },
        series: seriesData
    };
    if (typeof lineChart === 'undefined'){
        lineChart = Highcharts.chart('chart', config);
    } else {
        lineChart.update(config, true, true);
    }
    showTable(xaxis, cdata);
}

function showTable(xaxis, cdata) {
    var clasam = [];
    for (var i = 0;i < data.sensor_data['sample index'].length;i++){
        Object.keys(data.sensor_data).forEach(function (key) {
            if (key === 'class_label'){
                clasam.push(parseFloat(data.sensor_data['class_label'][i]));
            }
        });
    }
    if (Array.isArray(xaxis)){
        var tablecon = document.getElementById('tablecon');
        tablecon.innerHTML = '';
        for (var i = 0;i < xaxis.length;i++){
            var table = document.createElement('table');
            for (var j = 0;j < xaxis[i].categories.length;j++){
                if (j === 0){
                    var tr = document.createElement('tr');
                    tr.innerHTML = '<th>Sample Index</th>';
                    tr.innerHTML += '<th>Class Label</th>';


                    if (typeof cdata.sensor_data['sensor' + i] !== 'undefined'){
                        tr.innerHTML += '<th>Sensor' + i + '</th>';
                    } else if (typeof cdata.sensor_data['highest'] !== 'undefined'){
                        var status = (i === 0)?'highest':'lowest';
                        tr.innerHTML += '<th>'+status+'</th>';
                    }
                    table.appendChild(tr);

                    var tr = document.createElement('tr');
                    tr.innerHTML = '<td>Sample' + xaxis[i].categories[j]+'</td>';
                    tr.innerHTML += '<td>' + clasam[xaxis[i].categories[j]] + '</td>';
                    
                    if (typeof cdata.sensor_data['sensor' + i] !== 'undefined'){
                        tr.innerHTML += '<td>' + cdata.sensor_data['sensor' + i][j] + '</td>';
                    } else if (typeof cdata.sensor_data['highest'] !== 'undefined') {
                        var status = (i === 0) ? 'highest' : 'lowest';
                        tr.innerHTML += '<td>' + cdata.sensor_data[status][j] + '</td>';
                    }
                } else {
                    var tr = document.createElement('tr');
                    tr.innerHTML = '<td>Sample' + xaxis[i].categories[j] + '</td>';
                    tr.innerHTML += '<td>' + clasam[xaxis[i].categories[j]] + '</td>';

                    if (typeof cdata.sensor_data['sensor' + i] !== 'undefined'){
                        tr.innerHTML += '<td>' + cdata.sensor_data['sensor' + i][j] + '</td>';
                    } else if (typeof cdata.sensor_data['highest'] !== 'undefined') {
                        var status = (i == 0) ? 'highest' : 'lowest';
                        tr.innerHTML += '<td>' + cdata.sensor_data[status][j] + '</td>';
                    }
                }
                table.appendChild(tr);
            }
            tablecon.appendChild(table);
        }
    } else {
        var table = document.createElement('table');
        for (var i = 0; i < xaxis.categories.length; i++){
            if (i === 0) {
                var headrow = document.createElement('tr');
                headrow.innerHTML = '<th>Sample Index</th>';
                headrow.innerHTML += '<th>Class Label</th>';

                var tr = document.createElement('tr');
                tr.innerHTML = '<td>Sample' + xaxis.categories[i]+'</td>';
                tr.innerHTML += '<td>' + clasam[xaxis.categories[i]]+'</td>';

                Object.keys(cdata.sensor_data).forEach(function (key) {
                    if (key !== 'class_label' && key !== 'sample index') {
                        headrow.innerHTML += '<th>'+key+'</th>';
                        tr.innerHTML += '<td>' + cdata.sensor_data[key][i] + '</td>';
                    }
                });
                table.appendChild(headrow);
            } else {
                var tr = document.createElement('tr');
                Object.keys(cdata.sensor_data).forEach(function (key) {
                    if (key !== 'class_label' && key !== 'sample index') {
                        tr.innerHTML += '<td>' + cdata.sensor_data[key][i] + '</td>';
                    }
                });

                td = document.createElement('td');
                td.innerHTML = clasam[xaxis.categories[i]];
                tr.insertBefore(td, tr.childNodes[0]);

                td = document.createElement('td');
                td.innerHTML = 'Sample' + xaxis.categories[i];
                tr.insertBefore(td, tr.childNodes[0]);
            }
            table.appendChild(tr);
        }
        var tablecon = document.getElementById('tablecon');
        tablecon.innerHTML = '';
        tablecon.appendChild(table);
    }
}

window.addEventListener('scroll', function () {
    var table = document.getElementsByTagName('table')[0];
    if (table){
        var tablecon = document.getElementById('tablecon');
        var domRect = table.getBoundingClientRect();
        var tcdomRect = tablecon.getBoundingClientRect();
        if (domRect.width > tcdomRect.width) {
            var sr = document.getElementById('sright');
            var sl = document.getElementById('sleft');
            var domRect = document.getElementById('tablehead').getBoundingClientRect();
            var spaceBelow = window.innerHeight - domRect.bottom;
            if (spaceBelow >= 300) {
                if (tablecon.scrollLeft >= (table.offsetWidth - tablecon.offsetWidth)){
                    sr.style.display = 'none';
                } else {
                    sr.style.display = 'block';
                }
                if (tablecon.scrollLeft <= 0){
                    sl.style.display = 'none';
                } else {
                    sl.style.display = 'block';
                }      
            } else {
                sr.style.display = 'none';
                sl.style.display = 'none';
            }
        }
    }
});

function rightScroll(){
    var table = document.getElementsByTagName('table')[0];
    var tablecon = document.getElementById('tablecon');
    tablecon.scrollLeft += 100;
    if (tablecon.scrollLeft >= (table.offsetWidth - tablecon.offsetWidth)){
        document.getElementById('sright').style.display = 'none';
    } else {
        document.getElementById('sright').style.display = 'block';
    }
    document.getElementById('sleft').style.display = 'block';
} 

function leftScroll(){
    var tablecon = document.getElementById('tablecon');
    tablecon.scrollLeft -= 100;
    if (tablecon.scrollLeft <= 0){
        document.getElementById('sleft').style.display = 'none';
    } else {
        document.getElementById('sleft').style.display = 'block';
    }
    document.getElementById('sright').style.display = 'block';
}

document.getElementById('class_label').addEventListener('change', showChart);
document.getElementById('sensor').addEventListener('change', showChart);
document.getElementById('avsv').addEventListener('change', showChart);
document.getElementById('osv').addEventListener('change', showChart);
document.getElementById('hlv').addEventListener('change', showChart);

document.getElementById('sright').addEventListener('click', rightScroll);
document.getElementById('sleft').addEventListener('click', leftScroll);
