
var base_url="https://plus.nctu.edu.tw/"
var query_base_url=base_url+"api/"
var base_sem_year=99;
var link_name='知道更多';
var last_sem={
	id:16,
	real_id:"1032"
}
function append_title(rowsp){//
	$('table:contains("課號") tr:eq(0)').append("<td align='CENTER' width='70' bgcolor='#800000' rowspan='"+rowsp+"'><font style='ARIAL NARROW' color='#ffffff' size='3'>NCTU+<br>課程資訊</font></td>");
}
function get_cos_ids(){
	var cos_id_arr=[];
		//console.log($("select[name='fAcySem']").val());
		
		var regex = new RegExp("[0-9]{4}"); // expression here
		$('table:contains("課號") tr').each(function(){
			if($(this).find("td").length<3)return;
			var test=$(this).find("td:eq(1)").find("font").html().match(/[0-9]{4}/g);
			if(test){
				//console.log(test[0]);
				cos_id_arr.push(test[0]);
			}
			//console.log($(this).find("td:eq(1)").find("font[color='#0000FF']").html());
		});
	return cos_id_arr;
}
function get_links(cos_id_arr,sem_id){
	$.ajax({
			type:"POST",
			dataType:"json",
			crossDomain: true,
			url:query_base_url+"query_from_cos_adm",
			data:{
				cos_id:cos_id_arr,
				sem_id:sem_id
			},
			success:function(data){
				console.log(data);
				for(var i = 0,course ; course=data[i];i++){
					var row=$('tr:contains("'+course['cos_id']+'"):not(:contains("'+link_name+'"))');
					var rowsp=row.next().find('td').attr('colspan')=="13"&&window.location.pathname.match("adList.ASP")?"2":"1";
					var bgcolor=row.find("td:eq(0)").attr("bgcolor");
					var btn = "<td bgcolor='"+bgcolor+"' align='CENTER' rowspan='"+rowsp+"'><a target='_blank' href='"+base_url+"courses/"
										+course['cd_id']+"'>"+link_name+"</a></td>";	
					row.append(btn);
					
				}

			}
		});
}
function get_last_sem_id(){
	/*var d = new Date();
		var year=d.getFullYear()-1911;
		var half = d.getMonth()+1 > 6 ? "1":"2";
		if(half=="2")year-=1;
	return (""+(year))+half;*/
	return 16;
}
//for 選課系統
$(document).ready(function(){
	if(window.location.origin=="https://course.nctu.edu.tw"){
	var pathname=window.location.pathname;
	var cos_id_arr=get_cos_ids();
	if(cos_id_arr.length==0)return;
	if(pathname.match("adList.ASP")||pathname.match("inMenu.asp")){
		append_title('2');
		var sem_id=get_last_sem_id();
		get_links(cos_id_arr,sem_id);
	}
	else if(pathname.match("adNow.asp")){
		var sem_id=$("select[name='fAcySem']").val();
		if(sem_id!=last_sem.real_id)return;
		append_title('1');
		get_links(cos_id_arr,sem_id);
		
		$("#idPrint").append("<button id='export_course' style='color:#fff;background-color:#5bc0de;border-color: #357ebd;display: inline-block;padding: 6px 12px;margin-bottom: 0;font-size: 14px;font-weight: normal;line-height: 1.428571429;text-align: center;white-space: nowrap;vertical-align: middle;cursor: pointer;border: 1px solid transparent;border-radius: 4px;-webkit-user-select: none;-moz-user-select: none;-ms-user-select: none;-o-user-select: none;user-select: none;-webkit-appearance: button;'>匯入至NCTU+</button>");		
		
		$("#export_course").click(function(){			
			var password = prompt("請輸入您的e3密碼", "");
			if (password) {
				var student_id=$("dt:contains('學　　號：')").find("font").text();
				$.ajax({
					type:"POST",
					dataType:"json",
					crossDomain: true,
					async: true,
					url:query_base_url+"import_course",
					data:{
						username:student_id,
						password:password,
						cos_ids:cos_id_arr
					},
					success:function(data){			
						console.log(data);
					}
				});
			}
		});
	}
	}else{
		//for 課程時間表
		$("#crstime_search").click(function(){		
			var title="<th rowspan='2'>NCTU+<br>課程資訊</th>";
			$('th:contains("選別")').after(title);
			sem_id_arr=[];
			cos_id_arr=[];
			$('tr[name="tr_three_char"],[name="tr_two_char"]').each(function(index){ 
				if($(this).find('td:eq(1)').text().match(/[0-9]{4}/)){
					var sem=$(this).find('td:eq(0)').text();
					sem_id=(parseInt(sem.substring(0,sem.length-1))-base_sem_year)*3+1;
					if(sem[sem.length-1]=='下')sem_id+=1;
					if(sem_id>0){
						//console.log(sem_id);
						sem_id_arr.push(sem_id);
						cos_id_arr.push($(this).find('td:eq(1)').text());
					}
				}
			});
			$.ajax({
				type:"POST",
				dataType:"json",
				crossDomain: true,
				async: true,
				url:query_base_url+"query_from_time_table",
				data:{
					cos_id:cos_id_arr,
					sem_id:sem_id_arr
				},
				success:function(data){
					for(var i = 0,course ; course=data[i];i++){
						var btn = "<td rowspan='1'><a target='_blank' href='"+base_url+"courses/"
											+course['cd_id']+"'>"+link_name+"</a></td>";
						$('tr:contains("'+course['cos_id']+'"):not(:contains("'+link_name+'"))').append(btn);						
					}
				}
			});
		});
	}
});



