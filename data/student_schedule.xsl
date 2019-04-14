<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0" 
	xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
<xsl:output method='html' version='1.0' encoding='UTF-8' indent='yes'/>

	<!-- root template -->
    <xsl:template match="/">
		<html>
			<style>
				th {width: 200px;}
			</style>
		<body>
			<xsl:apply-templates/>
		</body>
		</html>
	</xsl:template>

	<!-- Template for each table block -->
	<xsl:template match="section">
		<h2>
			Student Timetables:
			<xsl:value-of select="@block"/>
			( hours)
		</h2>
		<table class="help" border="1">
			<!-- creates the tables time row -->
			<tr>
		        <th></th><th>0830</th><th>0930</th><th>1030</th><th>1130</th>
				<th>1230</th><th>1330</th><th>1430</th><th>1530</th><th>1630</th>
		    </tr>
		    <!-- below creates each row -->
		    <tr>
		    	<th>Monday</th>
		    	<xsl:call-template name="rows">
		    		<xsl:with-param name="day">Mon</xsl:with-param>
		    	</xsl:call-template>
		    </tr>
		    <tr>
		    	<th>Tuesday</th>
		      	<xsl:call-template name="rows">
		    		<xsl:with-param name="day">Tue</xsl:with-param>
		    	</xsl:call-template>
		    </tr>
		    <tr>
		    	<th>Wednesday</th>
		      	<xsl:call-template name="rows">
		    		<xsl:with-param name="day">Wed</xsl:with-param>
		    	</xsl:call-template>
		    </tr>
		    <tr>
		    	<th>Thursday</th>
		      	<xsl:call-template name="rows">
		    		<xsl:with-param name="day">Thu</xsl:with-param>
		    	</xsl:call-template>
		    </tr>	
		    <tr>
		    	<th>Friday</th>
		      	<xsl:call-template name="rows">
		    		<xsl:with-param name="day">Fri</xsl:with-param>
		    	</xsl:call-template>
		    </tr>
    	</table>
	</xsl:template>

	<!-- Template for each row in a table -->
	<xsl:template name="rows">
		<xsl:param name="day"/>

		<!-- uses the class template and sends in parameters that determine the column and row -->
      	<th><xsl:apply-templates>
      		<xsl:with-param name="start">830</xsl:with-param> 							<!-- determines column -->
      		<xsl:with-param name="end">929</xsl:with-param> 							<!-- determines column -->
      		<xsl:with-param name="day"><xsl:value-of select="$day"/></xsl:with-param> 	<!-- determines row -->
      	</xsl:apply-templates></th>
      	<th><xsl:apply-templates>
      		<xsl:with-param name="start">930</xsl:with-param>
      		<xsl:with-param name="end">1029</xsl:with-param>
      		<xsl:with-param name="day"><xsl:value-of select="$day"/></xsl:with-param>
      	</xsl:apply-templates></th>
      	<th><xsl:apply-templates>
      		<xsl:with-param name="start">1030</xsl:with-param>
      		<xsl:with-param name="end">1129</xsl:with-param>
      		<xsl:with-param name="day"><xsl:value-of select="$day"/></xsl:with-param>
      	</xsl:apply-templates></th>
      	<th><xsl:apply-templates>
      		<xsl:with-param name="start">1130</xsl:with-param>
      		<xsl:with-param name="end">1229</xsl:with-param>
      		<xsl:with-param name="day"><xsl:value-of select="$day"/></xsl:with-param>
      	</xsl:apply-templates></th>
      	<th><xsl:apply-templates>
      		<xsl:with-param name="start">1230</xsl:with-param>
      		<xsl:with-param name="end">1329</xsl:with-param>
      		<xsl:with-param name="day"><xsl:value-of select="$day"/></xsl:with-param>
      	</xsl:apply-templates></th>
      	<th><xsl:apply-templates>
      		<xsl:with-param name="start">1330</xsl:with-param>
      		<xsl:with-param name="end">1429</xsl:with-param>
      		<xsl:with-param name="day"><xsl:value-of select="$day"/></xsl:with-param>
      	</xsl:apply-templates></th>
      	<th><xsl:apply-templates>
      		<xsl:with-param name="start">1430</xsl:with-param>
      		<xsl:with-param name="end">1529</xsl:with-param>
      		<xsl:with-param name="day"><xsl:value-of select="$day"/></xsl:with-param>
      	</xsl:apply-templates></th>
      	<th><xsl:apply-templates>
      		<xsl:with-param name="start">1530</xsl:with-param>
      		<xsl:with-param name="end">1629</xsl:with-param>
      		<xsl:with-param name="day"><xsl:value-of select="$day"/></xsl:with-param>
      	</xsl:apply-templates></th>
      	<th><xsl:apply-templates>
      		<xsl:with-param name="start">1630</xsl:with-param>
      		<xsl:with-param name="end">1729</xsl:with-param>
      		<xsl:with-param name="day"><xsl:value-of select="$day"/></xsl:with-param>
      	</xsl:apply-templates></th>
	</xsl:template>

	<!-- Template for each cell in a row -->
	<xsl:template match="class">
		<xsl:param name="start"/>
		<xsl:param name="end"/>
		<xsl:param name="day"/>

  		<xsl:if test="day=$day and (end_time >= $start and $end >= start_time)">
  			<xsl:value-of select="@course"/><br/>
  			<xsl:value-of select="instructor"/><br/>
  			<xsl:value-of select="bldg_room"/><br/>
  			#<xsl:value-of select="@crn"/>
  		</xsl:if>
	</xsl:template>
</xsl:stylesheet>