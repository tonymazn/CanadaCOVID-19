var page3_canadamap;
var page3_data = [];
var page3_province = [];

Page3 = function (_parentElement, _parameters) {
    this._parentElement = _parentElement;

    this.initVis(_parentElement, _parameters);
    return this;
}

Page3.prototype.initVis = function (_parentElement, _parameters) {
    $("#datepicker").datepicker({
        dateFormat: "dd-mm-yy",
        minDate: _parameters.minDate,
        maxDate: _parameters.maxDate
    });

    page3_canadamap = new CanadaMap();

    $("#datepicker").on('change', function () {
        _parameters.endDate = endDate = common_parseTime($("#datepicker").val());
        if (_parameters.endDate < _parameters.startDate) {
            _parameters.startDate = _parameters.minDate;
        }
        page3Update(_parameters)
    });

    $("#type-select").on('change', function () {
        _parameters.type = $("#type-select").val();
        page3Update(_parameters)
    });

    d3.csv(common_datasource).then(function (data) {
        console.log("read data");
        console.log(data);

        common_provincesList.forEach(function (d) {
            page3_province.pop(0);
        });
        page3_province.pop(0);  //Canada

        console.log("page3_province");
        console.log(page3_province);
        data.forEach(function (d) {
            var item = [];
            item.numconf = +d.numconf;
            item.numdeaths = +d.numdeaths;
            item.numtested = +d.numtested;
            item.ratetotal = +d.ratetotal;
            item.newcase = item.numconf - getPreviousNumconf(d.prname);
            item.prname = d.prname;
            item.date = common_parseTime(d.date);
            item.team = d.prname;
            page3_data.push(item);

            //console.log(item.prname + " item.newcase");
            //console.log(getProvinceIndex(item.prname));
            //console.log(item.numconf);
            //console.log(getPreviousNumconf(d.prname));
            //console.log(item.newcase);

            setPreviousNumconf(d.prname, item.numconf);
        });

        page3Update(_parameters);

    });

}

function setPreviousNumconf(province, data) {
    if (province == common_Canada) {
        page3_province[common_provincesList.length + 1] = data;
    } else {
        page3_province[getProvinceIndex(province)] = data;
    }
}
function getPreviousNumconf(province) {
    var index = getProvinceIndex(province);
    if (index == -1) {
        return page3_province[common_provincesList.length + 1];
    }
    return page3_province[index];
}

Page3.prototype.trigger = function (_parameters) {
    _parameters.currentPage = 3;

    $("#type-select").val(_parameters.type);
    $("#datepicker").datepicker("setDate", _parameters.endDate);

    page3Update(_parameters);
}



function page3GetData(date, type) {
    var formatteddate = common_formatTime(date);
    var records = page3_data.filter(function (d) { return common_formatTime(d.date) == formatteddate; });
    var result = [];
    for (var i = 0; i < 15; i++) {
        if (type == "numconf") {
            result.push(records[i].numconf);
        } else if (type == "numdeaths") {
            result.push(records[i].numdeaths);
        } else if (type == "ratetotal") {
            result.push(records[i].ratetotal);
        } else if (type == "newcase") {
            result.push(records[i].newcase);
        } else {
            result.push(records[i].numtested);
        }
    };

    var reorderResult = new Array(14);
    reorderResult[0] = result[0]; //British Columbia
    reorderResult[10] = result[1];  //Alberta
    reorderResult[4] = result[2]; //Saskatchewan
    reorderResult[6] = result[3]; //Manitoba
    reorderResult[7] = result[4]; //Ontario
    reorderResult[1] = result[5]; //Quebec
    reorderResult[11] = result[6]; //Newfoundland and Labrador
    reorderResult[8] = result[7]; //New Brunswick
    reorderResult[12] = result[8]; //Northwest Territories
    reorderResult[3] = result[9]; //Prince Edward Island
    reorderResult[5] = result[10]; //Yukon
    reorderResult[9] = result[11]; //Northwest Territories
    reorderResult[2] = result[12]; // Nunavut

    reorderResult[13] = result[14]; // Canada

    return reorderResult;
}



function page3Update(_parameters) {
    var endDate = _parameters.endDate;
    var type = _parameters.type;
    var data = page3GetData(endDate, type);
    var total = data[13];
    data.pop();  // remove total

    console.log("total");
    console.log(total);

    $("#page3totalnumber").text(common_formatnumber(total));
    page3_canadamap.updateVis(data);
}

