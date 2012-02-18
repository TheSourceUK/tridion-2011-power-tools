﻿using System;
using System.ServiceModel;
using System.ServiceModel.Activation;
using System.ServiceModel.Web;
using System.Threading;
using PowerTools.Common.CoreService;
using PowerTools.Model.Progress;


namespace PowerTools.Model.Services
{
    [ServiceBehavior(InstanceContextMode = InstanceContextMode.Single, ConcurrencyMode = ConcurrencyMode.Multiple)]
    [AspNetCompatibilityRequirements(RequirementsMode = AspNetCompatibilityRequirementsMode.Required)]
    [ServiceContract(Namespace = "PowerTools.Model.Services")]
    
    public class Example : BaseService
    {
        private ExampleData _exampleData = null;

        [OperationContract, WebGet(ResponseFormat = WebMessageFormat.Json)]
        public ServiceProcess Execute()
        {
            return ExecuteAsync(null);
        }

        [OperationContract, WebGet(ResponseFormat = WebMessageFormat.Json)]
        public override ServiceProcess GetProcessStatus(string Id)
        {
            return base.GetProcessStatus(Id);
        }

        /// <summary>
        /// Serialized object for username may be overkill, but provides an example.
        /// </summary>
        /// <returns></returns>
        [OperationContract, WebGet(ResponseFormat = WebMessageFormat.Json)]
        public ExampleData GetUserInfo()
        {
            var coreService = Client.GetCoreService();
            _exampleData = new ExampleData()
            {
                UserName = coreService.GetCurrentUser().Title
            };
            return _exampleData;
        }

        public override void Process(ServiceProcess process, object arguments)
        {
            while (process.PercentComplete < 100)
            {
                process.IncrementCompletePercentage();
                process.SetStatus("Loading...");

                Random rnd = new Random(DateTime.Now.GetHashCode());
                Thread.Sleep(((int)(rnd.NextDouble() * 4) + 10) * 10);
            }
            process.Complete();
        }


    }
}